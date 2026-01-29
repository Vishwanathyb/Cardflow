import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAuthStore, useBoardStore, useCardStore, useLinkStore, useThemeStore } from '../lib/stores';
import { exportBoard } from '../lib/database';
import { toast } from 'sonner';
import CardNode from '../components/CardNode';
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
  X
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
  { value: 'feature', label: 'Feature' },
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'idea', label: 'Idea' },
  { value: 'epic', label: 'Epic' },
  { value: 'note', label: 'Note' }
];

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { currentBoard, fetchBoard } = useBoardStore();
  const { cards, fetchCards, createCard, updateCard, deleteCard, selectCard, selectedCard, clearSelection } = useCardStore();
  const { links, fetchLinks, createLink, deleteLink } = useLinkStore();

  const [activeView, setActiveView] = useState('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Dialog states
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
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

  // Load board data
  useEffect(() => {
    fetchBoard(boardId);
    fetchCards(boardId);
    fetchLinks(boardId);
  }, [boardId, fetchBoard, fetchCards, fetchLinks]);

  // Convert cards and links to React Flow nodes and edges
  useEffect(() => {
    const newNodes = cards.map(card => ({
      id: card.card_id,
      type: 'cardNode',
      position: { x: card.position_x || 0, y: card.position_y || 0 },
      data: {
        card,
        statuses: currentBoard?.statuses || [],
        onEdit: (c) => {
          selectCard(c);
          setShowEditCard(true);
        },
        onDelete: (id) => {
          if (confirm('Delete this card?')) {
            deleteCard(id);
            toast.success('Card deleted');
          }
        }
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
        label: linkType?.label,
        labelStyle: { fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.9 }
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [cards, links, currentBoard?.statuses, selectCard, deleteCard]);

  // Handle node position change
  const onNodeDragStop = useCallback((event, node) => {
    updateCard(node.id, {
      position_x: node.position.x,
      position_y: node.position.y
    });
  }, [updateCard]);

  // Handle connection
  const onConnect = useCallback((params) => {
    setPendingConnection(params);
    setShowLinkDialog(true);
  }, []);

  // Create link
  const handleCreateLink = (linkType) => {
    if (!pendingConnection) return;
    
    try {
      createLink({
        source_card_id: pendingConnection.source,
        target_card_id: pendingConnection.target,
        link_type: linkType
      });
      toast.success('Link created!');
    } catch (error) {
      toast.error('Failed to create link');
    } finally {
      setShowLinkDialog(false);
      setPendingConnection(null);
    }
  };

  // Create card
  const handleCreateCard = () => {
    if (!newCard.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    createCard({
      ...newCard,
      board_id: boardId,
      position_x: Math.random() * 500 + 100,
      position_y: Math.random() * 300 + 100,
      tags: newCard.tags ? newCard.tags.split(',').map(t => t.trim()) : []
    });
    
    setShowCreateCard(false);
    setNewCard({
      title: '',
      description: '',
      card_type: 'task',
      status: 'idea',
      priority: 'medium',
      tags: ''
    });
    toast.success('Card created!');
  };

  // Update card
  const handleUpdateCard = () => {
    if (!selectedCard) return;

    updateCard(selectedCard.card_id, {
      title: selectedCard.title,
      description: selectedCard.description,
      card_type: selectedCard.card_type,
      status: selectedCard.status,
      priority: selectedCard.priority,
      tags: typeof selectedCard.tags === 'string' 
        ? selectedCard.tags.split(',').map(t => t.trim())
        : selectedCard.tags
    });
    
    setShowEditCard(false);
    clearSelection();
    toast.success('Card updated!');
  };

  // Export board
  const handleExport = () => {
    const data = exportBoard(boardId);
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBoard?.name || 'board'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Board exported!');
  };

  // Delete edge
  const onEdgesDelete = useCallback((deletedEdges) => {
    deletedEdges.forEach(edge => {
      deleteLink(edge.id);
    });
  }, [deleteLink]);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || card.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [cards, searchQuery, filterStatus]);

  if (!currentBoard) {
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
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <h1 className="font-semibold" data-testid="board-title">{currentBoard.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex bg-muted rounded-lg p-1 mr-4">
            <button
              onClick={() => setActiveView('canvas')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'canvas' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              data-testid="canvas-view-tab"
            >
              <LayoutGrid className="w-4 h-4" />
              Canvas
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'kanban' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              data-testid="kanban-view-tab"
            >
              <Columns3 className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              data-testid="list-view-tab"
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          <button
            onClick={handleExport}
            className="p-2 rounded-lg border border-input hover:bg-muted transition-colors"
            data-testid="export-btn"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-input hover:bg-muted transition-colors"
            data-testid="theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowCreateCard(true)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            data-testid="create-card-btn"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
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
            <MiniMap nodeStrokeWidth={3} zoomable pannable />

            {/* Floating Toolbar */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-xl rounded-2xl p-3 border border-border/50 shadow-lg flex items-center gap-2 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-48 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  data-testid="search-cards-input"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="all">All Statuses</option>
                {currentBoard?.statuses?.map(status => (
                  <option key={status.name} value={status.name.toLowerCase()}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </ReactFlow>
        )}

        {activeView === 'kanban' && (
          <div className="h-full p-6 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max">
              {currentBoard?.statuses?.map(status => {
                const statusCards = filteredCards.filter(c => c.status.toLowerCase() === status.name.toLowerCase());
                return (
                  <div key={status.name} className="w-72 flex flex-col bg-muted/30 rounded-xl">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <h3 className="font-semibold text-sm">{status.name}</h3>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">{statusCards.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                      {statusCards.map(card => (
                        <div
                          key={card.card_id}
                          className="p-3 bg-card rounded-lg border border-border cursor-pointer hover:shadow-md transition-all"
                          onClick={() => {
                            selectCard(card);
                            setShowEditCard(true);
                          }}
                        >
                          <h4 className="font-medium text-sm">{card.title}</h4>
                          {card.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground capitalize">{card.card_type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              card.priority === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                              card.priority === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                              card.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {card.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'list' && (
          <div className="h-full p-6 overflow-auto">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Title</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map(card => (
                    <tr
                      key={card.card_id}
                      className="border-t border-border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        selectCard(card);
                        setShowEditCard(true);
                      }}
                    >
                      <td className="p-3">
                        <div className="font-medium">{card.title}</div>
                        {card.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{card.description}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm capitalize">{card.card_type}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentBoard?.statuses?.find(s => s.name.toLowerCase() === card.status.toLowerCase())?.color }}
                          />
                          <span className="text-sm capitalize">{card.status}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          card.priority === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                          card.priority === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                          card.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {card.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredCards.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No cards found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateCard(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Card</h2>
              <button onClick={() => setShowCreateCard(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={newCard.title}
                  onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Card title"
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="card-title-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  data-testid="card-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={newCard.card_type}
                    onChange={(e) => setNewCard(prev => ({ ...prev, card_type: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CARD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newCard.status}
                    onChange={(e) => setNewCard(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {currentBoard?.statuses?.map(status => (
                      <option key={status.name} value={status.name.toLowerCase()}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={newCard.priority}
                    onChange={(e) => setNewCard(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <input
                    value={newCard.tags}
                    onChange={(e) => setNewCard(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreateCard(false)} className="px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
              <button
                onClick={handleCreateCard}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
                data-testid="create-card-submit"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {showEditCard && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowEditCard(false); clearSelection(); }}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Card</h2>
              <button onClick={() => { setShowEditCard(false); clearSelection(); }} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={selectedCard.title}
                  onChange={(e) => selectCard({ ...selectedCard, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={selectedCard.description || ''}
                  onChange={(e) => selectCard({ ...selectedCard, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={selectedCard.card_type}
                    onChange={(e) => selectCard({ ...selectedCard, card_type: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CARD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={selectedCard.status}
                    onChange={(e) => selectCard({ ...selectedCard, status: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {currentBoard?.statuses?.map(status => (
                      <option key={status.name} value={status.name.toLowerCase()}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={selectedCard.priority}
                    onChange={(e) => selectCard({ ...selectedCard, priority: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <input
                    value={Array.isArray(selectedCard.tags) ? selectedCard.tags.join(', ') : selectedCard.tags || ''}
                    onChange={(e) => selectCard({ ...selectedCard, tags: e.target.value })}
                    placeholder="tag1, tag2"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowEditCard(false); clearSelection(); }} className="px-4 py-2 rounded-lg hover:bg-muted">Cancel</button>
              <button
                onClick={handleUpdateCard}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Type Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Select Link Type</h2>
            <div className="space-y-2">
              {LINK_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleCreateLink(type.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
