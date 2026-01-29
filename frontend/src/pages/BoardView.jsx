import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useOffline } from '../contexts/OfflineContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import CardNode from '../components/canvas/CardNode';
import KanbanView from '../components/views/KanbanView';
import ListView from '../components/views/ListView';
import {
  ArrowLeft,
  Plus,
  Sun,
  Moon,
  Layers,
  LayoutGrid,
  List,
  Columns3,
  Search,
  Download,
  Upload,
  Filter,
  Link2,
  X,
  Save,
  WifiOff
} from 'lucide-react';

const nodeTypes = { cardNode: CardNode };

const LINK_TYPES = [
  { value: 'depends_on', label: 'Depends On', color: '#EF4444' },
  { value: 'blocks', label: 'Blocks', color: '#F97316' },
  { value: 'related_to', label: 'Related To', color: '#6B7280' },
  { value: 'part_of', label: 'Part Of', color: '#8B5CF6' },
  { value: 'uses', label: 'Uses', color: '#06B6D4' },
  { value: 'references', label: 'References', color: '#10B981' },
  { value: 'duplicate_of', label: 'Duplicate Of', color: '#EC4899' }
];

const CARD_TYPES = [
  { value: 'feature', label: 'Feature', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
  { value: 'task', label: 'Task', color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
  { value: 'bug', label: 'Bug', color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  { value: 'idea', label: 'Idea', color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' },
  { value: 'epic', label: 'Epic', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' },
  { value: 'note', label: 'Note', color: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' }
];

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isOnline, cacheData, getCachedByIndex } = useOffline();
  const reactFlowWrapper = useRef(null);

  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Dialog states
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // New card form
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    card_type: 'task',
    status: 'idea',
    priority: 'medium',
    tags: ''
  });

  // Fetch board data
  const fetchBoardData = useCallback(async () => {
    try {
      const [boardRes, cardsRes, linksRes] = await Promise.all([
        api.get(`/boards/${boardId}`),
        api.get(`/cards?board_id=${boardId}`),
        api.get(`/links?board_id=${boardId}`)
      ]);

      setBoard(boardRes.data);
      setCards(cardsRes.data);
      setLinks(linksRes.data);

      // Cache data
      await cacheData('boards', boardRes.data);
      await cacheData('cards', cardsRes.data);
      await cacheData('links', linksRes.data);
    } catch (error) {
      // Try to load from cache
      const cachedCards = await getCachedByIndex('cards', 'board_id', boardId);
      const cachedLinks = await getCachedByIndex('links', 'board_id', boardId);
      
      if (cachedCards.length > 0) {
        setCards(cachedCards);
        setLinks(cachedLinks);
        toast.info('Loaded from offline cache');
      } else {
        toast.error('Failed to load board');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [boardId, cacheData, getCachedByIndex, navigate]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // Convert cards and links to React Flow nodes and edges
  useEffect(() => {
    const newNodes = cards.map(card => ({
      id: card.card_id,
      type: 'cardNode',
      position: { x: card.position_x, y: card.position_y },
      data: {
        card,
        statuses: board?.statuses || [],
        onEdit: (c) => {
          setSelectedCard(c);
          setEditCardOpen(true);
        },
        onDelete: handleDeleteCard
      }
    }));

    const newEdges = links.map(link => {
      const linkType = LINK_TYPES.find(t => t.value === link.link_type);
      return {
        id: link.link_id,
        source: link.source_card_id,
        target: link.target_card_id,
        type: 'smoothstep',
        animated: link.link_type === 'depends_on' || link.link_type === 'blocks',
        style: {
          stroke: linkType?.color || link.color,
          strokeWidth: 2,
          strokeDasharray: link.line_style === 'dashed' ? '5,5' : undefined
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: linkType?.color || link.color
        },
        label: link.label || linkType?.label,
        labelStyle: { fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 },
        data: { link }
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [cards, links, board?.statuses]);

  // Handle node position change
  const onNodeDragStop = useCallback(async (event, node) => {
    try {
      await api.put(`/cards/${node.id}`, {
        position_x: node.position.x,
        position_y: node.position.y
      });
      
      setCards(prev => prev.map(card =>
        card.card_id === node.id
          ? { ...card, position_x: node.position.x, position_y: node.position.y }
          : card
      ));
    } catch (error) {
      console.error('Failed to save position:', error);
    }
  }, []);

  // Handle connection (creating links)
  const onConnect = useCallback((params) => {
    setPendingConnection(params);
    setLinkDialogOpen(true);
  }, []);

  // Create link after selecting type
  const handleCreateLink = async (linkType) => {
    if (!pendingConnection) return;

    try {
      const response = await api.post('/links', {
        source_card_id: pendingConnection.source,
        target_card_id: pendingConnection.target,
        link_type: linkType
      });
      
      setLinks(prev => [...prev, response.data]);
      toast.success('Link created!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create link');
    } finally {
      setLinkDialogOpen(false);
      setPendingConnection(null);
    }
  };

  // Create card
  const handleCreateCard = async () => {
    if (!newCard.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const response = await api.post('/cards', {
        ...newCard,
        board_id: boardId,
        position_x: Math.random() * 500 + 100,
        position_y: Math.random() * 300 + 100,
        tags: newCard.tags ? newCard.tags.split(',').map(t => t.trim()) : []
      });
      
      setCards(prev => [...prev, response.data]);
      setCreateCardOpen(false);
      setNewCard({
        title: '',
        description: '',
        card_type: 'task',
        status: 'idea',
        priority: 'medium',
        tags: ''
      });
      toast.success('Card created!');
    } catch (error) {
      toast.error('Failed to create card');
    }
  };

  // Update card
  const handleUpdateCard = async () => {
    if (!selectedCard) return;

    try {
      const response = await api.put(`/cards/${selectedCard.card_id}`, {
        title: selectedCard.title,
        description: selectedCard.description,
        card_type: selectedCard.card_type,
        status: selectedCard.status,
        priority: selectedCard.priority,
        tags: typeof selectedCard.tags === 'string' 
          ? selectedCard.tags.split(',').map(t => t.trim())
          : selectedCard.tags
      });
      
      setCards(prev => prev.map(card =>
        card.card_id === selectedCard.card_id ? response.data : card
      ));
      setEditCardOpen(false);
      setSelectedCard(null);
      toast.success('Card updated!');
    } catch (error) {
      toast.error('Failed to update card');
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      setCards(prev => prev.filter(c => c.card_id !== cardId));
      setLinks(prev => prev.filter(l => 
        l.source_card_id !== cardId && l.target_card_id !== cardId
      ));
      toast.success('Card deleted');
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  // Delete edge/link
  const onEdgesDelete = useCallback(async (deletedEdges) => {
    for (const edge of deletedEdges) {
      try {
        await api.delete(`/links/${edge.id}`);
        setLinks(prev => prev.filter(l => l.link_id !== edge.id));
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  }, []);

  // Export board
  const handleExport = async () => {
    try {
      const response = await api.get(`/export/${boardId}`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${board?.name || 'board'}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Board exported!');
    } catch (error) {
      toast.error('Failed to export board');
    }
  };

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || card.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesType = filterType === 'all' || card.card_type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [cards, searchQuery, filterStatus, filterType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <h1 className="font-semibold" data-testid="board-title">{board?.name}</h1>
          </div>

          {!isOnline && (
            <Badge variant="secondary" className="gap-1">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView} className="mr-4">
            <TabsList className="h-9">
              <TabsTrigger value="canvas" className="gap-1 px-3" data-testid="canvas-view-tab">
                <LayoutGrid className="w-4 h-4" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1 px-3" data-testid="kanban-view-tab">
                <Columns3 className="w-4 h-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1 px-3" data-testid="list-view-tab">
                <List className="w-4 h-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="icon" onClick={handleExport} data-testid="export-btn">
            <Download className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={toggleTheme} data-testid="theme-toggle">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button onClick={() => setCreateCardOpen(true)} data-testid="create-card-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden" ref={reactFlowWrapper}>
        {activeView === 'canvas' && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            deleteKeyCode={['Backspace', 'Delete']}
            data-testid="react-flow-canvas"
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
            />

            {/* Floating Toolbar */}
            <Panel position="top-left" className="glass rounded-2xl p-3 m-4 flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-9 rounded-lg"
                  data-testid="search-cards-input"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-9" data-testid="filter-status-select">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {board?.statuses?.map(status => (
                    <SelectItem key={status.name} value={status.name.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 h-9" data-testid="filter-type-select">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {CARD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Panel>
          </ReactFlow>
        )}

        {activeView === 'kanban' && (
          <KanbanView
            cards={filteredCards}
            statuses={board?.statuses || []}
            onCardClick={(card) => {
              setSelectedCard(card);
              setEditCardOpen(true);
            }}
            onStatusChange={async (cardId, newStatus) => {
              try {
                await api.put(`/cards/${cardId}`, { status: newStatus });
                setCards(prev => prev.map(c =>
                  c.card_id === cardId ? { ...c, status: newStatus } : c
                ));
              } catch (error) {
                toast.error('Failed to update status');
              }
            }}
          />
        )}

        {activeView === 'list' && (
          <ListView
            cards={filteredCards}
            statuses={board?.statuses || []}
            onCardClick={(card) => {
              setSelectedCard(card);
              setEditCardOpen(true);
            }}
            onDeleteCard={handleDeleteCard}
          />
        )}
      </div>

      {/* Create Card Dialog */}
      <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Card</DialogTitle>
            <DialogDescription>Add a new card to your board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={newCard.title}
                onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Card title"
                data-testid="card-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={newCard.description}
                onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows={3}
                data-testid="card-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newCard.card_type}
                  onValueChange={(value) => setNewCard(prev => ({ ...prev, card_type: value }))}
                >
                  <SelectTrigger data-testid="card-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newCard.status}
                  onValueChange={(value) => setNewCard(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger data-testid="card-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {board?.statuses?.map(status => (
                      <SelectItem key={status.name} value={status.name.toLowerCase()}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newCard.priority}
                  onValueChange={(value) => setNewCard(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger data-testid="card-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-tags">Tags</Label>
                <Input
                  id="card-tags"
                  value={newCard.tags}
                  onChange={(e) => setNewCard(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2"
                  data-testid="card-tags-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCardOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCard} data-testid="create-card-submit">Create Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={editCardOpen} onOpenChange={setEditCardOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedCard.title}
                  onChange={(e) => setSelectedCard(prev => ({ ...prev, title: e.target.value }))}
                  data-testid="edit-card-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedCard.description || ''}
                  onChange={(e) => setSelectedCard(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  data-testid="edit-card-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={selectedCard.card_type}
                    onValueChange={(value) => setSelectedCard(prev => ({ ...prev, card_type: value }))}
                  >
                    <SelectTrigger data-testid="edit-card-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedCard.status}
                    onValueChange={(value) => setSelectedCard(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger data-testid="edit-card-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {board?.statuses?.map(status => (
                        <SelectItem key={status.name} value={status.name.toLowerCase()}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={selectedCard.priority}
                    onValueChange={(value) => setSelectedCard(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger data-testid="edit-card-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={Array.isArray(selectedCard.tags) ? selectedCard.tags.join(', ') : selectedCard.tags || ''}
                    onChange={(e) => setSelectedCard(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2"
                    data-testid="edit-card-tags-input"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCardOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCard} data-testid="update-card-submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Type Selection Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Link Type</DialogTitle>
            <DialogDescription>Choose how these cards are related.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4">
            {LINK_TYPES.map(type => (
              <Button
                key={type.value}
                variant="outline"
                className="justify-start gap-3"
                onClick={() => handleCreateLink(type.value)}
                data-testid={`link-type-${type.value}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                {type.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
