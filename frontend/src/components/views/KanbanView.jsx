import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const CARD_STYLES = {
  feature: 'border-l-blue-500',
  task: 'border-l-green-500',
  bug: 'border-l-red-500',
  idea: 'border-l-yellow-500',
  epic: 'border-l-purple-500',
  note: 'border-l-gray-500'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
  critical: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
};

export default function KanbanView({ cards, statuses, onCardClick, onStatusChange }) {
  // Group cards by status
  const cardsByStatus = statuses.reduce((acc, status) => {
    acc[status.name.toLowerCase()] = cards.filter(
      card => card.status.toLowerCase() === status.name.toLowerCase()
    );
    return acc;
  }, {});

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.card_id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      onStatusChange(cardId, status.name.toLowerCase());
    }
  };

  return (
    <div className="h-full p-6 overflow-x-auto" data-testid="kanban-view">
      <div className="flex gap-4 h-full min-w-max">
        {statuses.map(status => (
          <div
            key={status.name}
            className="w-72 flex flex-col bg-muted/30 rounded-xl"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            data-testid={`kanban-column-${status.name.toLowerCase()}`}
          >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <h3 className="font-semibold text-sm">{status.name}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {cardsByStatus[status.name.toLowerCase()]?.length || 0}
              </Badge>
            </div>

            {/* Cards */}
            <ScrollArea className="flex-1 px-2 pb-2">
              <div className="space-y-2">
                {cardsByStatus[status.name.toLowerCase()]?.map(card => (
                  <Card
                    key={card.card_id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-all border-l-4 ${CARD_STYLES[card.card_type]}`}
                    onClick={() => onCardClick(card)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    data-testid={`kanban-card-${card.card_id}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-2">{card.title}</h4>
                        <Badge className={`text-xs flex-shrink-0 ${PRIORITY_COLORS[card.priority]}`}>
                          {card.priority}
                        </Badge>
                      </div>
                      
                      {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {card.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">
                          {card.card_type}
                        </span>
                        {card.tags && card.tags.length > 0 && (
                          <div className="flex gap-1">
                            {card.tags.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
