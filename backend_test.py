#!/usr/bin/env python3
"""
CardFlow Backend API Testing Suite
Tests all API endpoints for the visual project planning application
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class CardFlowAPITester:
    def __init__(self, base_url: str = "https://visual-planner-16.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.workspace_id = None
        self.board_id = None
        self.card_id = None
        self.link_id = None

    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED")
        else:
            print(f"❌ {test_name}: FAILED - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = True) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.make_request('GET', '/health', auth_required=False)
        self.log_result(
            "Health Check", 
            success and response.get('status') == 'healthy',
            f"Response: {response}" if not success else "",
            response
        )
        return success

    def test_register_user(self):
        """Test user registration"""
        timestamp = int(datetime.now().timestamp())
        test_user = {
            "email": f"test.user.{timestamp}@cardflow.test",
            "password": "TestPassword123!",
            "name": f"Test User {timestamp}"
        }
        
        success, response = self.make_request('POST', '/auth/register', test_user, auth_required=False)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['user_id']
            self.log_result("User Registration", True, "", response)
        else:
            self.log_result("User Registration", False, f"Response: {response}", response)
        
        return success

    def test_login_user(self):
        """Test user login with existing credentials"""
        if not self.token:
            # Create a user first for login test
            timestamp = int(datetime.now().timestamp())
            register_data = {
                "email": f"login.test.{timestamp}@cardflow.test",
                "password": "LoginTest123!",
                "name": f"Login Test User {timestamp}"
            }
            
            # Register first
            reg_success, reg_response = self.make_request('POST', '/auth/register', register_data, auth_required=False)
            if not reg_success:
                self.log_result("Login Test Setup", False, "Failed to create test user for login", reg_response)
                return False
            
            # Now test login
            login_data = {
                "email": register_data["email"],
                "password": register_data["password"]
            }
            
            success, response = self.make_request('POST', '/auth/login', login_data, auth_required=False)
            
            if success and 'token' in response:
                # Don't overwrite the main token, just verify login works
                self.log_result("User Login", True, "", response)
            else:
                self.log_result("User Login", False, f"Response: {response}", response)
            
            return success
        else:
            # Already have token from registration, just verify /auth/me works
            return self.test_get_current_user()

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', '/auth/me')
        
        expected_fields = ['user_id', 'email', 'name']
        has_required_fields = all(field in response for field in expected_fields) if success else False
        
        self.log_result(
            "Get Current User", 
            success and has_required_fields,
            f"Missing fields: {[f for f in expected_fields if f not in response]}" if success and not has_required_fields else f"Response: {response}" if not success else "",
            response
        )
        return success and has_required_fields

    def test_create_workspace(self):
        """Test workspace creation"""
        workspace_data = {
            "name": f"Test Workspace {datetime.now().strftime('%H%M%S')}",
            "description": "Test workspace for API testing",
            "color": "#4F46E5"
        }
        
        success, response = self.make_request('POST', '/workspaces', workspace_data, expected_status=200)
        
        if success and 'workspace_id' in response:
            self.workspace_id = response['workspace_id']
            self.log_result("Create Workspace", True, "", response)
        else:
            self.log_result("Create Workspace", False, f"Response: {response}", response)
        
        return success

    def test_get_workspaces(self):
        """Test getting user workspaces"""
        success, response = self.make_request('GET', '/workspaces')
        
        is_list = isinstance(response, list) if success else False
        self.log_result(
            "Get Workspaces", 
            success and is_list,
            f"Expected list, got {type(response)}" if success and not is_list else f"Response: {response}" if not success else "",
            response
        )
        return success and is_list

    def test_create_board(self):
        """Test board creation"""
        if not self.workspace_id:
            self.log_result("Create Board", False, "No workspace_id available", {})
            return False
        
        board_data = {
            "name": f"Test Board {datetime.now().strftime('%H%M%S')}",
            "description": "Test board for API testing",
            "workspace_id": self.workspace_id
        }
        
        success, response = self.make_request('POST', '/boards', board_data, expected_status=200)
        
        if success and 'board_id' in response:
            self.board_id = response['board_id']
            self.log_result("Create Board", True, "", response)
        else:
            self.log_result("Create Board", False, f"Response: {response}", response)
        
        return success

    def test_get_boards(self):
        """Test getting boards"""
        if not self.workspace_id:
            self.log_result("Get Boards", False, "No workspace_id available", {})
            return False
        
        success, response = self.make_request('GET', f'/boards?workspace_id={self.workspace_id}')
        
        is_list = isinstance(response, list) if success else False
        self.log_result(
            "Get Boards", 
            success and is_list,
            f"Expected list, got {type(response)}" if success and not is_list else f"Response: {response}" if not success else "",
            response
        )
        return success and is_list

    def test_create_card(self):
        """Test card creation"""
        if not self.board_id:
            self.log_result("Create Card", False, "No board_id available", {})
            return False
        
        card_data = {
            "title": f"Test Card {datetime.now().strftime('%H%M%S')}",
            "description": "Test card for API testing",
            "card_type": "task",
            "status": "idea",
            "board_id": self.board_id,
            "position_x": 100.0,
            "position_y": 100.0,
            "priority": "medium",
            "tags": ["test", "api"]
        }
        
        success, response = self.make_request('POST', '/cards', card_data, expected_status=200)
        
        if success and 'card_id' in response:
            self.card_id = response['card_id']
            self.log_result("Create Card", True, "", response)
        else:
            self.log_result("Create Card", False, f"Response: {response}", response)
        
        return success

    def test_get_cards(self):
        """Test getting cards"""
        if not self.board_id:
            self.log_result("Get Cards", False, "No board_id available", {})
            return False
        
        success, response = self.make_request('GET', f'/cards?board_id={self.board_id}')
        
        is_list = isinstance(response, list) if success else False
        self.log_result(
            "Get Cards", 
            success and is_list,
            f"Expected list, got {type(response)}" if success and not is_list else f"Response: {response}" if not success else "",
            response
        )
        return success and is_list

    def test_update_card(self):
        """Test card update"""
        if not self.card_id:
            self.log_result("Update Card", False, "No card_id available", {})
            return False
        
        update_data = {
            "title": f"Updated Test Card {datetime.now().strftime('%H%M%S')}",
            "description": "Updated description",
            "status": "planned",
            "priority": "high"
        }
        
        success, response = self.make_request('PUT', f'/cards/{self.card_id}', update_data)
        
        self.log_result(
            "Update Card", 
            success,
            f"Response: {response}" if not success else "",
            response
        )
        return success

    def test_create_link(self):
        """Test link creation between cards"""
        if not self.card_id or not self.board_id:
            self.log_result("Create Link", False, "Missing card_id or board_id", {})
            return False
        
        # Create a second card for linking
        card_data = {
            "title": f"Link Target Card {datetime.now().strftime('%H%M%S')}",
            "description": "Target card for link testing",
            "card_type": "feature",
            "status": "idea",
            "board_id": self.board_id,
            "position_x": 200.0,
            "position_y": 200.0
        }
        
        success, card_response = self.make_request('POST', '/cards', card_data, expected_status=200)
        if not success or 'card_id' not in card_response:
            self.log_result("Create Link", False, "Failed to create target card for linking", card_response)
            return False
        
        target_card_id = card_response['card_id']
        
        # Create link
        link_data = {
            "source_card_id": self.card_id,
            "target_card_id": target_card_id,
            "link_type": "depends_on",
            "label": "Test Link"
        }
        
        success, response = self.make_request('POST', '/links', link_data, expected_status=200)
        
        if success and 'link_id' in response:
            self.link_id = response['link_id']
            self.log_result("Create Link", True, "", response)
        else:
            self.log_result("Create Link", False, f"Response: {response}", response)
        
        return success

    def test_get_links(self):
        """Test getting links"""
        if not self.board_id:
            self.log_result("Get Links", False, "No board_id available", {})
            return False
        
        success, response = self.make_request('GET', f'/links?board_id={self.board_id}')
        
        is_list = isinstance(response, list) if success else False
        self.log_result(
            "Get Links", 
            success and is_list,
            f"Expected list, got {type(response)}" if success and not is_list else f"Response: {response}" if not success else "",
            response
        )
        return success and is_list

    def test_search_cards(self):
        """Test card search functionality"""
        if not self.board_id:
            self.log_result("Search Cards", False, "No board_id available", {})
            return False
        
        success, response = self.make_request('GET', f'/search?q=Test&board_id={self.board_id}')
        
        is_list = isinstance(response, list) if success else False
        self.log_result(
            "Search Cards", 
            success and is_list,
            f"Expected list, got {type(response)}" if success and not is_list else f"Response: {response}" if not success else "",
            response
        )
        return success and is_list

    def test_export_board(self):
        """Test board export"""
        if not self.board_id:
            self.log_result("Export Board", False, "No board_id available", {})
            return False
        
        success, response = self.make_request('GET', f'/export/{self.board_id}')
        
        has_required_keys = all(key in response for key in ['board', 'cards', 'links']) if success else False
        self.log_result(
            "Export Board", 
            success and has_required_keys,
            f"Missing keys in export data" if success and not has_required_keys else f"Response: {response}" if not success else "",
            response
        )
        return success and has_required_keys

    def test_logout(self):
        """Test logout functionality"""
        success, response = self.make_request('POST', '/auth/logout')
        
        self.log_result(
            "Logout", 
            success,
            f"Response: {response}" if not success else "",
            response
        )
        return success

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting CardFlow Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Core API tests in logical order
        test_sequence = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_register_user),
            ("User Login", self.test_login_user),
            ("Get Current User", self.test_get_current_user),
            ("Create Workspace", self.test_create_workspace),
            ("Get Workspaces", self.test_get_workspaces),
            ("Create Board", self.test_create_board),
            ("Get Boards", self.test_get_boards),
            ("Create Card", self.test_create_card),
            ("Get Cards", self.test_get_cards),
            ("Update Card", self.test_update_card),
            ("Create Link", self.test_create_link),
            ("Get Links", self.test_get_links),
            ("Search Cards", self.test_search_cards),
            ("Export Board", self.test_export_board),
            ("Logout", self.test_logout)
        ]
        
        for test_name, test_func in test_sequence:
            print(f"\n🔍 Running: {test_name}")
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
                print(f"❌ {test_name}: EXCEPTION - {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = CardFlowAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())