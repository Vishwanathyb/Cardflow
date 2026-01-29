import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
  critical: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
};

const TYPE_COLORS = {
  feature: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  task: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
  bug: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  idea: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
  epic: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
  note: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
};

export default function ListView({ cards, statuses, onCardClick, onDeleteCard }) {
  const getStatusColor = (statusName) => {
    const status = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase());
    return status?.color || '#6B7280';
  };

  return (
    <div className="h-full p-6 overflow-auto" data-testid="list-view">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map(card => (
              <TableRow
                key={card.card_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCardClick(card)}
                data-testid={`list-row-${card.card_id}`}
              >
                <TableCell className="font-medium">
                  <div>
                    <p className="line-clamp-1">{card.title}</p>
                    {card.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {card.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${TYPE_COLORS[card.card_type]} capitalize`}>
                    {card.card_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(card.status) }}
                    />
                    <span className="text-sm capitalize">{card.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={PRIORITY_COLORS[card.priority]}>
                    {card.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {card.tags?.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {card.tags?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(card.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`list-menu-${card.card_id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCardClick(card); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDeleteCard(card.card_id); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {cards.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No cards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
