import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit, Flag, Tag } from 'lucide-react';

const CARD_STYLES = {
  feature: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
  task: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800',
  bug: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
  idea: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800',
  epic: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
  note: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
};

const TYPE_COLORS = {
  feature: 'text-blue-600 dark:text-blue-400',
  task: 'text-green-600 dark:text-green-400',
  bug: 'text-red-600 dark:text-red-400',
  idea: 'text-yellow-600 dark:text-yellow-400',
  epic: 'text-purple-600 dark:text-purple-400',
  note: 'text-gray-600 dark:text-gray-400'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
  critical: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
};

function CardNode({ data }) {
  const { card, statuses, onEdit, onDelete } = data;
  const cardStyle = CARD_STYLES[card.card_type] || CARD_STYLES.note;
  const typeColor = TYPE_COLORS[card.card_type] || TYPE_COLORS.note;
  const status = statuses?.find(s => s.name.toLowerCase() === card.status.toLowerCase());

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-primary !w-2 !h-2" />
      
      <div
        className={`w-56 rounded-xl border-2 shadow-lg transition-all hover:shadow-xl ${cardStyle}`}
        data-testid={`card-node-${card.card_id}`}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-inherit flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${typeColor}`}>
            {card.card_type}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-black/5 dark:hover:bg-white/5"
                data-testid={`card-menu-${card.card_id}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(card)} data-testid={`edit-card-${card.card_id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(card.card_id)}
                data-testid={`delete-card-${card.card_id}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2">
            {card.title}
          </h4>
          
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-inherit flex items-center justify-between">
          <div className="flex items-center gap-1">
            {status && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
            )}
            <span className="text-xs text-muted-foreground capitalize">
              {card.status}
            </span>
          </div>
          
          <Badge className={`text-xs ${PRIORITY_COLORS[card.priority]}`}>
            {card.priority}
          </Badge>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
    </>
  );
}

export default memo(CardNode);
