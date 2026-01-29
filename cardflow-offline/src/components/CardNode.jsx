import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

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
      
      <div className={`w-56 rounded-xl border-2 shadow-lg transition-all hover:shadow-xl ${cardStyle}`}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-inherit flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${typeColor}`}>
            {card.card_type}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(card)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(card.card_id)}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
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
                <span key={i} className="text-xs px-1.5 py-0.5 bg-muted rounded">
                  {tag}
                </span>
              ))}
              {card.tags.length > 3 && (
                <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                  +{card.tags.length - 3}
                </span>
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
          
          <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[card.priority]}`}>
            {card.priority}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
    </>
  );
}

export default memo(CardNode);
