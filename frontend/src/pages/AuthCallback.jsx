import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleSession, setUserData } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash || window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          console.error('No session_id found in URL');
          navigate('/login', { replace: true });
          return;
        }

        const sessionId = sessionIdMatch[1];
        
        // Process the session with backend
        const userData = await processGoogleSession(sessionId);
        setUserData(userData);
        
        // Navigate to dashboard with user data
        navigate('/dashboard', { 
          replace: true,
          state: { user: userData }
        });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [location.hash, navigate, processGoogleSession, setUserData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
          <Layers className="w-10 h-10 text-primary-foreground" strokeWidth={2} />
        </div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
