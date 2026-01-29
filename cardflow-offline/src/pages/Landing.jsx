import { useNavigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from '../lib/stores';
import { 
  Layers, 
  Sun, 
  Moon, 
  ArrowRight,
  Layout,
  GitBranch,
  WifiOff,
  Download,
  Link2,
  Database
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Layers,
      title: 'Infinite Canvas',
      description: 'Pan, zoom, and place cards anywhere. Your ideas, your layout.'
    },
    {
      icon: Link2,
      title: 'Visual Linking',
      description: 'Connect cards with meaningful relationships. See dependencies at a glance.'
    },
    {
      icon: Layout,
      title: 'Multiple Views',
      description: 'Switch between Canvas, Kanban, and List views instantly.'
    },
    {
      icon: GitBranch,
      title: 'Smart Status',
      description: 'Customizable status workflows that adapt to your process.'
    },
    {
      icon: WifiOff,
      title: '100% Offline',
      description: 'Works completely offline. Your data stays on your device.'
    },
    {
      icon: Database,
      title: 'SQLite Storage',
      description: 'Fast, reliable local database. Export and backup anytime.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight">CardFlow</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Offline</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                data-testid="go-to-dashboard-btn"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-full hover:bg-muted transition-colors"
                  data-testid="login-btn"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                  data-testid="get-started-btn"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-8">
            <WifiOff className="w-4 h-4" />
            Works 100% Offline • No Internet Required
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Plan projects the way
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              your mind works
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            CardFlow Offline is a visual planning tool that works completely on your device. 
            No cloud, no subscription, no internet needed. Your data, your control.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 shadow-lg"
              data-testid="hero-cta-btn"
            >
              Start Planning Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need, offline
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Full-featured project planning with SQLite database. Works on desktop and mobile.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Available for all platforms
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Download CardFlow for your operating system or use it directly in your browser as a PWA.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Download for</div>
                <div className="font-semibold">Windows</div>
              </div>
            </button>
            
            <button className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Download for</div>
                <div className="font-semibold">Linux</div>
              </div>
            </button>
            
            <button className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Download for</div>
                <div className="font-semibold">macOS</div>
              </div>
            </button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            Or install as a Progressive Web App (PWA) from your browser for mobile devices.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="font-semibold">CardFlow Offline</span>
          </div>
          <p className="text-sm text-muted-foreground">
            100% offline. Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
