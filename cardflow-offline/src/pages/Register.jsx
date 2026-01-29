import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../lib/stores';
import { toast } from 'sonner';
import { Layers, Sun, Moon, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      register(email, name, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted transition-colors"
          data-testid="back-to-home-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-lg">
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Layers className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-muted-foreground mt-2">Start planning visually with CardFlow</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="email-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password (optional for offline)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium" data-testid="login-link">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
