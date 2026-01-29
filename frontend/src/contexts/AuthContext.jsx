import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('cardflow-token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Skip if we're on the auth callback page processing session_id
      if (location.hash?.includes('session_id=')) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('cardflow-token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.hash]);

  // JWT Login
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('cardflow-token', newToken);
    setToken(newToken);
    setUser(userData);
    
    return userData;
  }, []);

  // JWT Register
  const register = useCallback(async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('cardflow-token', newToken);
    setToken(newToken);
    setUser(userData);
    
    return userData;
  }, []);

  // Google OAuth - redirect to Emergent Auth
  const loginWithGoogle = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  // Process Google OAuth session
  const processGoogleSession = useCallback(async (sessionId) => {
    const response = await api.post('/auth/session', {}, {
      headers: { 'X-Session-ID': sessionId }
    });
    setUser(response.data);
    return response.data;
  }, []);

  // Set user directly (used by AuthCallback)
  const setUserData = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors
    }
    localStorage.removeItem('cardflow-token');
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      processGoogleSession,
      setUserData,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
