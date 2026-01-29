import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useOffline } from '../contexts/OfflineContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import {
  Layers,
  Sun,
  Moon,
  Plus,
  LayoutGrid,
  Folder,
  MoreHorizontal,
  Trash2,
  Settings,
  LogOut,
  User,
  Search,
  Wifi,
  WifiOff,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, cacheData, getCachedData, pendingCount } = useOffline();

  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceColor, setNewWorkspaceColor] = useState('#4F46E5');
  const [newBoardName, setNewBoardName] = useState('');

  const workspaceColors = [
    '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6'
  ];

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data);
      await cacheData('workspaces', response.data);
      
      // Auto-select first workspace if none selected
      if (response.data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.data[0]);
      }
    } catch (error) {
      // Try to load from cache
      const cached = await getCachedData('workspaces');
      if (cached && cached.length > 0) {
        setWorkspaces(cached);
        if (!selectedWorkspace) {
          setSelectedWorkspace(cached[0]);
        }
        toast.info('Loaded from offline cache');
      } else {
        toast.error('Failed to load workspaces');
      }
    }
  }, [cacheData, getCachedData, selectedWorkspace]);

  // Fetch boards for selected workspace
  const fetchBoards = useCallback(async () => {
    if (!selectedWorkspace) {
      setBoards([]);
      return;
    }
    
    try {
      const response = await api.get(`/boards?workspace_id=${selectedWorkspace.workspace_id}`);
      setBoards(response.data);
      await cacheData('boards', response.data);
    } catch (error) {
      const cached = await getCachedData('boards');
      if (cached) {
        const filtered = cached.filter(b => b.workspace_id === selectedWorkspace.workspace_id);
        setBoards(filtered);
      }
    }
  }, [selectedWorkspace, cacheData, getCachedData]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchWorkspaces();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [selectedWorkspace, fetchBoards]);

  // Create workspace
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    try {
      const response = await api.post('/workspaces', {
        name: newWorkspaceName,
        color: newWorkspaceColor
      });
      setWorkspaces(prev => [...prev, response.data]);
      setSelectedWorkspace(response.data);
      setCreateWorkspaceOpen(false);
      setNewWorkspaceName('');
      toast.success('Workspace created!');
    } catch (error) {
      toast.error('Failed to create workspace');
    }
  };

  // Delete workspace
  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      setWorkspaces(prev => prev.filter(w => w.workspace_id !== workspaceId));
      if (selectedWorkspace?.workspace_id === workspaceId) {
        setSelectedWorkspace(workspaces.find(w => w.workspace_id !== workspaceId) || null);
      }
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  // Create board
  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !selectedWorkspace) {
      toast.error('Please enter a board name');
      return;
    }

    try {
      const response = await api.post('/boards', {
        name: newBoardName,
        workspace_id: selectedWorkspace.workspace_id
      });
      setBoards(prev => [...prev, response.data]);
      setCreateBoardOpen(false);
      setNewBoardName('');
      toast.success('Board created!');
    } catch (error) {
      toast.error('Failed to create board');
    }
  };

  // Delete board
  const handleDeleteBoard = async (boardId) => {
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards(prev => prev.filter(b => b.board_id !== boardId));
      toast.success('Board deleted');
    } catch (error) {
      toast.error('Failed to delete board');
    }
  };

  // Filter boards by search
  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold">CardFlow</span>
          </div>
        </div>

        {/* Workspaces */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workspaces</span>
            <Dialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" data-testid="create-workspace-btn">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Workspace</DialogTitle>
                  <DialogDescription>Add a new workspace to organize your boards.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Name</Label>
                    <Input
                      id="workspace-name"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="My Workspace"
                      data-testid="workspace-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {workspaceColors.map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full transition-all ${newWorkspaceColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewWorkspaceColor(color)}
                          data-testid={`workspace-color-${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateWorkspace} data-testid="create-workspace-submit">Create Workspace</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="flex-1 px-2">
            {workspaces.map(workspace => (
              <div
                key={workspace.workspace_id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedWorkspace?.workspace_id === workspace.workspace_id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedWorkspace(workspace)}
                data-testid={`workspace-${workspace.workspace_id}`}
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: workspace.color }}
                />
                <span className="flex-1 truncate text-sm font-medium">{workspace.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      data-testid={`workspace-menu-${workspace.workspace_id}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteWorkspace(workspace.workspace_id)}
                      data-testid={`delete-workspace-${workspace.workspace_id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {workspaces.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No workspaces yet
              </p>
            )}
          </ScrollArea>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2" data-testid="user-menu-btn">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="flex-1 text-left truncate text-sm">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={toggleTheme} data-testid="theme-toggle-menu">
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold" data-testid="dashboard-title">
              {selectedWorkspace?.name || 'Select a Workspace'}
            </h1>
            {!isOnline && (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="outline" className="gap-1">
                {pendingCount} pending sync
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 rounded-full"
                data-testid="search-boards-input"
              />
            </div>

            <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-full"
                  disabled={!selectedWorkspace}
                  data-testid="create-board-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Board</DialogTitle>
                  <DialogDescription>
                    Add a new board to {selectedWorkspace?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="board-name">Name</Label>
                    <Input
                      id="board-name"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Sprint Planning"
                      data-testid="board-name-input"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateBoard} data-testid="create-board-submit">Create Board</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Boards Grid */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedWorkspace ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Folder className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No workspace selected</h2>
              <p className="text-muted-foreground mb-4">Create or select a workspace to get started</p>
              <Button onClick={() => setCreateWorkspaceOpen(true)} data-testid="empty-create-workspace-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
              <p className="text-muted-foreground mb-4">Create your first board to start planning</p>
              <Button onClick={() => setCreateBoardOpen(true)} data-testid="empty-create-board-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map(board => (
                <Card
                  key={board.board_id}
                  className="group cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate(`/board/${board.board_id}`)}
                  data-testid={`board-card-${board.board_id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{board.name}</CardTitle>
                        {board.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {board.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            data-testid={`board-menu-${board.board_id}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoard(board.board_id);
                            }}
                            data-testid={`delete-board-${board.board_id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        {board.statuses?.slice(0, 4).map((status, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                        ))}
                      </div>
                      <span>{board.statuses?.length || 0} statuses</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(board.updated_at).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
