import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Layers, 
  Link2, 
  Zap, 
  Sun, 
  Moon, 
  ArrowRight,
  Layout,
  GitBranch,
  Wifi,
  WifiOff,
  Download,
  Share2
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

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
      title: 'Offline First',
      description: 'Work anywhere, anytime. Your data syncs when you\'re back online.'
    },
    {
      icon: Download,
      title: 'Export & Import',
      description: 'Export boards as JSON or import from other tools.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight">CardFlow</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="rounded-full font-medium"
                data-testid="go-to-dashboard-btn"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="rounded-full"
                  data-testid="login-btn"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="rounded-full font-medium"
                  data-testid="get-started-btn"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            Visual project planning, reimagined
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Plan projects the way
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              your mind works
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            CardFlow is a visual planning tool that lets you organize work using cards on an infinite canvas. 
            Connect ideas, track progress, and see the big picture.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button 
              size="lg" 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="rounded-full font-medium text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              data-testid="hero-cta-btn"
            >
              Start Planning Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-full font-medium text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="learn-more-btn"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Canvas Preview */}
      <section className="py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
            <div className="p-8 md:p-12">
              {/* Mock Canvas */}
              <div className="relative h-[400px] md:h-[500px] bg-muted/30 rounded-xl overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }} />
                
                {/* Mock cards */}
                <div className="absolute top-12 left-12 w-48 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 shadow-lg">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Feature</div>
                  <div className="font-semibold text-sm">User Dashboard</div>
                  <div className="text-xs text-muted-foreground mt-1">Core feature for MVP</div>
                </div>
                
                <div className="absolute top-32 left-72 w-48 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 shadow-lg">
                  <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">Idea</div>
                  <div className="font-semibold text-sm">AI Suggestions</div>
                  <div className="text-xs text-muted-foreground mt-1">Auto-link similar cards</div>
                </div>
                
                <div className="absolute top-56 left-16 w-48 p-4 rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 shadow-lg">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">Task</div>
                  <div className="font-semibold text-sm">Auth System</div>
                  <div className="text-xs text-muted-foreground mt-1">JWT + Google OAuth</div>
                </div>
                
                <div className="absolute top-16 right-24 w-48 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 shadow-lg">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Epic</div>
                  <div className="font-semibold text-sm">Canvas System</div>
                  <div className="text-xs text-muted-foreground mt-1">Infinite pan & zoom</div>
                </div>
                
                <div className="absolute bottom-24 right-16 w-48 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 shadow-lg">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Bug</div>
                  <div className="font-semibold text-sm">Fix drag lag</div>
                  <div className="text-xs text-muted-foreground mt-1">Optimize rendering</div>
                </div>
                
                {/* Mock connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <path d="M 208 60 Q 280 60 288 100" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  <path d="M 160 100 Q 160 180 160 200" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to plan visually
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              CardFlow combines the flexibility of a whiteboard with the structure of project management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
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

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Ready to plan differently?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join developers and teams who are already using CardFlow to visualize their projects.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="rounded-full font-medium text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            data-testid="cta-btn"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="font-semibold">CardFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CardFlow. Built for visual thinkers.
          </p>
        </div>
      </footer>
    </div>
  );
}
