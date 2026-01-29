import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useWorkspaceStore, useBoardStore, useThemeStore } from '../lib/stores';
import { exportDatabaseFile, importDatabaseFile } from '../lib/database';
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
  LogOut,
  User,
  Search,
  Download,
  Upload,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { workspaces, selectedWorkspace, fetchWorkspaces, createWorkspace, deleteWorkspace, selectWorkspace } = useWorkspaceStore();
  const { boards, fetchBoards, createBoard, deleteBoard } = useBoardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceColor, setNewWorkspaceColor] = useState('#4F46E5');
  const [newBoardName, setNewBoardName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const workspaceColors = [
    '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6'
  ];

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchBoards(selectedWorkspace.workspace_id);
    }
  }, [selectedWorkspace, fetchBoards]);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }
    createWorkspace(newWorkspaceName, newWorkspaceColor);
    setShowCreateWorkspace(false);
    setNewWorkspaceName('');
    toast.success('Workspace created!');
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim() || !selectedWorkspace) {
      toast.error('Please enter a board name');
      return;
    }
    createBoard(newBoardName, selectedWorkspace.workspace_id);
    setShowCreateBoard(false);
    setNewBoardName('');
    toast.success('Board created!');
  };

  const handleExportDatabase = () => {
    const blob = exportDatabaseFile();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cardflow-backup-${new Date().toISOString().split('T')[0]}.db`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Database exported!');
    }
  };

  const handleImportDatabase = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importDatabaseFile(file);
        toast.success('Database imported! Refreshing...');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to import database');
      }
    }
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="p-1 rounded hover:bg-muted transition-colors"
              data-testid="create-workspace-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {workspaces.map(workspace => (
              <div
                key={workspace.workspace_id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedWorkspace?.workspace_id === workspace.workspace_id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => selectWorkspace(workspace)}
                data-testid={`workspace-${workspace.workspace_id}`}
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: workspace.color }}
                />
                <span className="flex-1 truncate text-sm font-medium">{workspace.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this workspace?')) {
                      deleteWorkspace(workspace.workspace_id);
                      toast.success('Workspace deleted');
                    }
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {workspaces.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No workspaces yet
              </p>
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="user-menu-btn"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 text-left truncate text-sm">{user?.name || 'User'}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={handleExportDatabase}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export Database</span>
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Import Database</span>
                  <input type="file" accept=".db" onChange={handleImportDatabase} className="hidden" />
                </label>
                <div className="border-t border-border" />
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
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
            <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              SQLite
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                data-testid="search-boards-input"
              />
            </div>

            <button
              onClick={() => setShowCreateBoard(true)}
              disabled={!selectedWorkspace}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              data-testid="create-board-btn"
            >
              <Plus className="w-4 h-4" />
              New Board
            </button>
          </div>
        </header>

        {/* Boards Grid */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedWorkspace ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Folder className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No workspace selected</h2>
              <p className="text-muted-foreground mb-4">Create or select a workspace to get started</p>
              <button
                onClick={() => setShowCreateWorkspace(true)}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <LayoutGrid className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
              <p className="text-muted-foreground mb-4">Create your first board to start planning</p>
              <button
                onClick={() => setShowCreateBoard(true)}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map(board => (
                <div
                  key={board.board_id}
                  className="group p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
                  onClick={() => navigate(`/board/${board.board_id}`)}
                  data-testid={`board-card-${board.board_id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{board.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this board?')) {
                          deleteBoard(board.board_id);
                          toast.success('Board deleted');
                        }
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {board.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {board.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {board.statuses?.slice(0, 4).map((status, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateWorkspace(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Workspace</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="workspace-name-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {workspaceColors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full transition-all ${newWorkspaceColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewWorkspaceColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateWorkspace(false)}
                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                data-testid="create-workspace-submit"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateBoard(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Board</h2>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Sprint Planning"
                className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="board-name-input"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateBoard(false)}
                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                data-testid="create-board-submit"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
