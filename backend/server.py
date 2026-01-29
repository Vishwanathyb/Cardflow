from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'cardflow-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 7

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#4F46E5"

class Workspace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    workspace_id: str
    name: str
    description: str = ""
    color: str = "#4F46E5"
    owner_id: str
    created_at: datetime
    updated_at: datetime

class BoardCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    workspace_id: str

class Board(BaseModel):
    model_config = ConfigDict(extra="ignore")
    board_id: str
    name: str
    description: str = ""
    workspace_id: str
    owner_id: str
    statuses: List[dict] = []
    created_at: datetime
    updated_at: datetime

class CardCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    card_type: str = "task"
    status: str = "idea"
    board_id: str
    position_x: float = 0
    position_y: float = 0
    priority: Optional[str] = "medium"
    assignees: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    due_date: Optional[str] = None
    checklist: Optional[List[dict]] = []
    color: Optional[str] = None

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    card_type: Optional[str] = None
    status: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    priority: Optional[str] = None
    assignees: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None
    checklist: Optional[List[dict]] = None
    color: Optional[str] = None

class Card(BaseModel):
    model_config = ConfigDict(extra="ignore")
    card_id: str
    title: str
    description: str = ""
    card_type: str
    status: str
    board_id: str
    position_x: float
    position_y: float
    priority: str = "medium"
    assignees: List[str] = []
    tags: List[str] = []
    due_date: Optional[str] = None
    checklist: List[dict] = []
    color: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

class LinkCreate(BaseModel):
    source_card_id: str
    target_card_id: str
    link_type: str = "related_to"
    label: Optional[str] = None
    color: Optional[str] = "#6B7280"
    line_style: str = "solid"

class Link(BaseModel):
    model_config = ConfigDict(extra="ignore")
    link_id: str
    source_card_id: str
    target_card_id: str
    link_type: str
    label: Optional[str] = None
    color: str = "#6B7280"
    line_style: str = "solid"
    board_id: str
    created_by: str
    created_at: datetime

# Default statuses for new boards
DEFAULT_STATUSES = [
    {"name": "Idea", "color": "#FBBF24", "order": 0},
    {"name": "Planned", "color": "#60A5FA", "order": 1},
    {"name": "In Progress", "color": "#34D399", "order": 2},
    {"name": "Testing", "color": "#A78BFA", "order": 3},
    {"name": "Done", "color": "#10B981", "order": 4},
    {"name": "Archived", "color": "#6B7280", "order": 5}
]

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request) -> dict:
    # Check cookie first for Google OAuth
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
    
    # Check Authorization header for JWT
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_jwt_token(token)
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if user:
            return user
    
    raise HTTPException(status_code=401, detail="Not authenticated")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id)
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "picture": None
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not user.get("password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"])
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture")
        }
    }

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Handle Google OAuth session from Emergent Auth"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Fetch user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        auth_data = auth_response.json()
    
    # Check if user exists
    user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if user:
        user_id = user["user_id"]
        # Update user data if needed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": auth_data["email"],
        "name": auth_data["name"],
        "picture": auth_data.get("picture")
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture")
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== WORKSPACE ROUTES ====================

@api_router.post("/workspaces", response_model=Workspace)
async def create_workspace(data: WorkspaceCreate, user: dict = Depends(get_current_user)):
    workspace_id = f"ws_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    workspace_doc = {
        "workspace_id": workspace_id,
        "name": data.name,
        "description": data.description or "",
        "color": data.color or "#4F46E5",
        "owner_id": user["user_id"],
        "created_at": now,
        "updated_at": now
    }
    await db.workspaces.insert_one(workspace_doc)
    
    result = await db.workspaces.find_one({"workspace_id": workspace_id}, {"_id": 0})
    result["created_at"] = datetime.fromisoformat(result["created_at"])
    result["updated_at"] = datetime.fromisoformat(result["updated_at"])
    return result

@api_router.get("/workspaces", response_model=List[Workspace])
async def get_workspaces(user: dict = Depends(get_current_user)):
    workspaces = await db.workspaces.find({"owner_id": user["user_id"]}, {"_id": 0}).to_list(100)
    for ws in workspaces:
        if isinstance(ws["created_at"], str):
            ws["created_at"] = datetime.fromisoformat(ws["created_at"])
        if isinstance(ws["updated_at"], str):
            ws["updated_at"] = datetime.fromisoformat(ws["updated_at"])
    return workspaces

@api_router.get("/workspaces/{workspace_id}", response_model=Workspace)
async def get_workspace(workspace_id: str, user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"workspace_id": workspace_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if isinstance(ws["created_at"], str):
        ws["created_at"] = datetime.fromisoformat(ws["created_at"])
    if isinstance(ws["updated_at"], str):
        ws["updated_at"] = datetime.fromisoformat(ws["updated_at"])
    return ws

@api_router.delete("/workspaces/{workspace_id}")
async def delete_workspace(workspace_id: str, user: dict = Depends(get_current_user)):
    result = await db.workspaces.delete_one({"workspace_id": workspace_id, "owner_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workspace not found")
    # Delete all boards and cards in workspace
    boards = await db.boards.find({"workspace_id": workspace_id}, {"board_id": 1, "_id": 0}).to_list(1000)
    board_ids = [b["board_id"] for b in boards]
    await db.boards.delete_many({"workspace_id": workspace_id})
    await db.cards.delete_many({"board_id": {"$in": board_ids}})
    await db.links.delete_many({"board_id": {"$in": board_ids}})
    return {"message": "Workspace deleted"}

# ==================== BOARD ROUTES ====================

@api_router.post("/boards", response_model=Board)
async def create_board(data: BoardCreate, user: dict = Depends(get_current_user)):
    # Verify workspace ownership
    ws = await db.workspaces.find_one({"workspace_id": data.workspace_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    board_id = f"board_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    board_doc = {
        "board_id": board_id,
        "name": data.name,
        "description": data.description or "",
        "workspace_id": data.workspace_id,
        "owner_id": user["user_id"],
        "statuses": DEFAULT_STATUSES,
        "created_at": now,
        "updated_at": now
    }
    await db.boards.insert_one(board_doc)
    
    result = await db.boards.find_one({"board_id": board_id}, {"_id": 0})
    result["created_at"] = datetime.fromisoformat(result["created_at"])
    result["updated_at"] = datetime.fromisoformat(result["updated_at"])
    return result

@api_router.get("/boards", response_model=List[Board])
async def get_boards(workspace_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"owner_id": user["user_id"]}
    if workspace_id:
        query["workspace_id"] = workspace_id
    
    boards = await db.boards.find(query, {"_id": 0}).to_list(100)
    for board in boards:
        if isinstance(board["created_at"], str):
            board["created_at"] = datetime.fromisoformat(board["created_at"])
        if isinstance(board["updated_at"], str):
            board["updated_at"] = datetime.fromisoformat(board["updated_at"])
    return boards

@api_router.get("/boards/{board_id}", response_model=Board)
async def get_board(board_id: str, user: dict = Depends(get_current_user)):
    board = await db.boards.find_one({"board_id": board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if isinstance(board["created_at"], str):
        board["created_at"] = datetime.fromisoformat(board["created_at"])
    if isinstance(board["updated_at"], str):
        board["updated_at"] = datetime.fromisoformat(board["updated_at"])
    return board

@api_router.put("/boards/{board_id}")
async def update_board(board_id: str, data: dict, user: dict = Depends(get_current_user)):
    board = await db.boards.find_one({"board_id": board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    update_data = {k: v for k, v in data.items() if v is not None and k not in ["board_id", "owner_id", "workspace_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.boards.update_one({"board_id": board_id}, {"$set": update_data})
    return {"message": "Board updated"}

@api_router.delete("/boards/{board_id}")
async def delete_board(board_id: str, user: dict = Depends(get_current_user)):
    result = await db.boards.delete_one({"board_id": board_id, "owner_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Board not found")
    await db.cards.delete_many({"board_id": board_id})
    await db.links.delete_many({"board_id": board_id})
    return {"message": "Board deleted"}

# ==================== CARD ROUTES ====================

@api_router.post("/cards", response_model=Card)
async def create_card(data: CardCreate, user: dict = Depends(get_current_user)):
    # Verify board ownership
    board = await db.boards.find_one({"board_id": data.board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    card_id = f"card_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    card_doc = {
        "card_id": card_id,
        "title": data.title,
        "description": data.description or "",
        "card_type": data.card_type,
        "status": data.status,
        "board_id": data.board_id,
        "position_x": data.position_x,
        "position_y": data.position_y,
        "priority": data.priority or "medium",
        "assignees": data.assignees or [],
        "tags": data.tags or [],
        "due_date": data.due_date,
        "checklist": data.checklist or [],
        "color": data.color,
        "created_by": user["user_id"],
        "created_at": now,
        "updated_at": now
    }
    await db.cards.insert_one(card_doc)
    
    result = await db.cards.find_one({"card_id": card_id}, {"_id": 0})
    result["created_at"] = datetime.fromisoformat(result["created_at"])
    result["updated_at"] = datetime.fromisoformat(result["updated_at"])
    return result

@api_router.get("/cards", response_model=List[Card])
async def get_cards(board_id: str, user: dict = Depends(get_current_user)):
    # Verify board ownership
    board = await db.boards.find_one({"board_id": board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    cards = await db.cards.find({"board_id": board_id}, {"_id": 0}).to_list(1000)
    for card in cards:
        if isinstance(card["created_at"], str):
            card["created_at"] = datetime.fromisoformat(card["created_at"])
        if isinstance(card["updated_at"], str):
            card["updated_at"] = datetime.fromisoformat(card["updated_at"])
    return cards

@api_router.get("/cards/{card_id}", response_model=Card)
async def get_card(card_id: str, user: dict = Depends(get_current_user)):
    card = await db.cards.find_one({"card_id": card_id, "created_by": user["user_id"]}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    if isinstance(card["created_at"], str):
        card["created_at"] = datetime.fromisoformat(card["created_at"])
    if isinstance(card["updated_at"], str):
        card["updated_at"] = datetime.fromisoformat(card["updated_at"])
    return card

@api_router.put("/cards/{card_id}")
async def update_card(card_id: str, data: CardUpdate, user: dict = Depends(get_current_user)):
    card = await db.cards.find_one({"card_id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Verify board ownership
    board = await db.boards.find_one({"board_id": card["board_id"], "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cards.update_one({"card_id": card_id}, {"$set": update_data})
    
    updated = await db.cards.find_one({"card_id": card_id}, {"_id": 0})
    if isinstance(updated["created_at"], str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    if isinstance(updated["updated_at"], str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    return updated

@api_router.delete("/cards/{card_id}")
async def delete_card(card_id: str, user: dict = Depends(get_current_user)):
    card = await db.cards.find_one({"card_id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Verify board ownership
    board = await db.boards.find_one({"board_id": card["board_id"], "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.cards.delete_one({"card_id": card_id})
    # Delete all links involving this card
    await db.links.delete_many({"$or": [{"source_card_id": card_id}, {"target_card_id": card_id}]})
    return {"message": "Card deleted"}

# ==================== LINK ROUTES ====================

@api_router.post("/links", response_model=Link)
async def create_link(data: LinkCreate, user: dict = Depends(get_current_user)):
    # Verify source card exists and get board_id
    source_card = await db.cards.find_one({"card_id": data.source_card_id}, {"_id": 0})
    if not source_card:
        raise HTTPException(status_code=404, detail="Source card not found")
    
    # Verify target card exists
    target_card = await db.cards.find_one({"card_id": data.target_card_id}, {"_id": 0})
    if not target_card:
        raise HTTPException(status_code=404, detail="Target card not found")
    
    # Verify board ownership
    board = await db.boards.find_one({"board_id": source_card["board_id"], "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if link already exists
    existing = await db.links.find_one({
        "source_card_id": data.source_card_id,
        "target_card_id": data.target_card_id
    }, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Link already exists")
    
    link_id = f"link_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    link_doc = {
        "link_id": link_id,
        "source_card_id": data.source_card_id,
        "target_card_id": data.target_card_id,
        "link_type": data.link_type,
        "label": data.label,
        "color": data.color or "#6B7280",
        "line_style": data.line_style,
        "board_id": source_card["board_id"],
        "created_by": user["user_id"],
        "created_at": now
    }
    await db.links.insert_one(link_doc)
    
    result = await db.links.find_one({"link_id": link_id}, {"_id": 0})
    result["created_at"] = datetime.fromisoformat(result["created_at"])
    return result

@api_router.get("/links", response_model=List[Link])
async def get_links(board_id: str, user: dict = Depends(get_current_user)):
    # Verify board ownership
    board = await db.boards.find_one({"board_id": board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    links = await db.links.find({"board_id": board_id}, {"_id": 0}).to_list(1000)
    for link in links:
        if isinstance(link["created_at"], str):
            link["created_at"] = datetime.fromisoformat(link["created_at"])
    return links

@api_router.delete("/links/{link_id}")
async def delete_link(link_id: str, user: dict = Depends(get_current_user)):
    link = await db.links.find_one({"link_id": link_id}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Verify board ownership
    board = await db.boards.find_one({"board_id": link["board_id"], "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.links.delete_one({"link_id": link_id})
    return {"message": "Link deleted"}

# ==================== SEARCH ====================

@api_router.get("/search")
async def search_cards(q: str, board_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"created_by": user["user_id"]}
    if board_id:
        query["board_id"] = board_id
    
    # Text search on title and description
    query["$or"] = [
        {"title": {"$regex": q, "$options": "i"}},
        {"description": {"$regex": q, "$options": "i"}},
        {"tags": {"$regex": q, "$options": "i"}}
    ]
    
    cards = await db.cards.find(query, {"_id": 0}).to_list(100)
    for card in cards:
        if isinstance(card["created_at"], str):
            card["created_at"] = datetime.fromisoformat(card["created_at"])
        if isinstance(card["updated_at"], str):
            card["updated_at"] = datetime.fromisoformat(card["updated_at"])
    return cards

# ==================== EXPORT/IMPORT ====================

@api_router.get("/export/{board_id}")
async def export_board(board_id: str, user: dict = Depends(get_current_user)):
    board = await db.boards.find_one({"board_id": board_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    cards = await db.cards.find({"board_id": board_id}, {"_id": 0}).to_list(1000)
    links = await db.links.find({"board_id": board_id}, {"_id": 0}).to_list(1000)
    
    return {
        "board": board,
        "cards": cards,
        "links": links,
        "exported_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/import")
async def import_board(data: dict, user: dict = Depends(get_current_user)):
    board_data = data.get("board", {})
    cards_data = data.get("cards", [])
    links_data = data.get("links", [])
    workspace_id = data.get("workspace_id")
    
    if not workspace_id:
        raise HTTPException(status_code=400, detail="workspace_id required")
    
    # Verify workspace ownership
    ws = await db.workspaces.find_one({"workspace_id": workspace_id, "owner_id": user["user_id"]}, {"_id": 0})
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Create new board
    new_board_id = f"board_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_board = {
        "board_id": new_board_id,
        "name": board_data.get("name", "Imported Board"),
        "description": board_data.get("description", ""),
        "workspace_id": workspace_id,
        "owner_id": user["user_id"],
        "statuses": board_data.get("statuses", DEFAULT_STATUSES),
        "created_at": now,
        "updated_at": now
    }
    await db.boards.insert_one(new_board)
    
    # Map old card IDs to new ones
    card_id_map = {}
    
    for card in cards_data:
        old_id = card.get("card_id")
        new_card_id = f"card_{uuid.uuid4().hex[:12]}"
        card_id_map[old_id] = new_card_id
        
        new_card = {
            "card_id": new_card_id,
            "title": card.get("title", ""),
            "description": card.get("description", ""),
            "card_type": card.get("card_type", "task"),
            "status": card.get("status", "idea"),
            "board_id": new_board_id,
            "position_x": card.get("position_x", 0),
            "position_y": card.get("position_y", 0),
            "priority": card.get("priority", "medium"),
            "assignees": card.get("assignees", []),
            "tags": card.get("tags", []),
            "due_date": card.get("due_date"),
            "checklist": card.get("checklist", []),
            "color": card.get("color"),
            "created_by": user["user_id"],
            "created_at": now,
            "updated_at": now
        }
        await db.cards.insert_one(new_card)
    
    # Create links with new IDs
    for link in links_data:
        old_source = link.get("source_card_id")
        old_target = link.get("target_card_id")
        
        if old_source in card_id_map and old_target in card_id_map:
            new_link = {
                "link_id": f"link_{uuid.uuid4().hex[:12]}",
                "source_card_id": card_id_map[old_source],
                "target_card_id": card_id_map[old_target],
                "link_type": link.get("link_type", "related_to"),
                "label": link.get("label"),
                "color": link.get("color", "#6B7280"),
                "line_style": link.get("line_style", "solid"),
                "board_id": new_board_id,
                "created_by": user["user_id"],
                "created_at": now
            }
            await db.links.insert_one(new_link)
    
    return {"board_id": new_board_id, "message": "Board imported successfully"}

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
