import { Card, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Action } from '../types';
import { CheckCircle, Circle, Tag, Calendar, Clock, MoreHorizontal, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ActionCardProps {
  action: Action;
  onToggleComplete?: (action: Action) => void;
  onUndo?: (action: Action) => void;
  onPostpone?: (action: Action) => void;
  onDismiss?: (action: Action) => void;
  onClick?: (action: Action) => void;
  className?: string;
}

const priorityColors = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/20 text-accent-foreground border-warning/30',
  low: 'bg-success/10 text-success border-success/30',
};

const statusConfig = {
  pending: { label: 'Pending', color: 'text-primary' },
  completed: { label: 'Completed', color: 'text-success' },
  postponed: { label: 'Postponed', color: 'text-warning' },
  dismissed: { label: 'Dismissed', color: 'text-muted-foreground' },
};

export default function ActionCard({ 
  action, 
  onToggleComplete, 
  onUndo,
  onPostpone,
  onDismiss,
  onClick, 
  className 
}: ActionCardProps) {
  const [showActions, setShowActions] = useState(false);

  const isOverdue = action.dueDate && 
    action.status === 'pending' && 
    new Date(action.dueDate) < new Date();

  const priorityColor = action.priority 
    ? priorityColors[action.priority as keyof typeof priorityColors] 
    : priorityColors.medium;

  const statusInfo = statusConfig[action.status as keyof typeof statusConfig];

  return (
    <Card
      className={cn(
        'p-4 transition-all relative overflow-hidden',
        action.status === 'completed' ? 'opacity-70' : '',
        action.status === 'dismissed' ? 'opacity-50' : '',
        isOverdue ? 'border-l-4 border-l-destructive' : '',
        className
      )}
      onClick={() => onClick?.(action)}
      data-icod-id="src_components_actioncard_tsx_fb05">
      {/* Priority indicator bar */}
      <div
        className={cn('absolute left-0 top-0 bottom-0 w-1', 
          action.priority === 'high' ? 'bg-destructive' :
          action.priority === 'medium' ? 'bg-warning' : 'bg-success'
        )}
        data-icod-id="src_components_actioncard_tsx_c832" />
      <div
        className="flex items-start gap-3 pl-2"
        data-icod-id="src_components_actioncard_tsx_9f98">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (action.status === 'completed') {
              onUndo?.(action);
            } else {
              onToggleComplete?.(action);
            }
          }}
          className={cn(
            'mt-0.5 transition-colors',
            action.status === 'completed' ? 'text-success hover:text-success/80' : 'text-primary hover:text-primary/80'
          )}
          data-icod-id="src_components_actioncard_tsx_1b21">
          {action.status === 'completed' ? (
            <CheckCircle className="h-5 w-5" data-icod-id="src_components_actioncard_tsx_53e8" />
          ) : (
            <Circle className="h-5 w-5" data-icod-id="src_components_actioncard_tsx_6b00" />
          )}
        </button>

        <div
          className="flex-1 min-w-0"
          data-icod-id="src_components_actioncard_tsx_7039">
          <div
            className="flex items-start justify-between gap-2"
            data-icod-id="src_components_actioncard_tsx_d7e7">
            <h4
              className={cn(
                'font-medium truncate',
                action.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
              )}
              data-icod-id="src_components_actioncard_tsx_a113">
              {action.title}
            </h4>
            
            {/* Quick actions menu */}
            {(onPostpone || onDismiss) && action.status !== 'completed' && action.status !== 'dismissed' && (
              <div className="relative" data-icod-id="src_components_actioncard_tsx_1fdc">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  data-icod-id="src_components_actioncard_tsx_2748">
                  <MoreHorizontal className="h-4 w-4" data-icod-id="src_components_actioncard_tsx_9bd5" />
                </Button>
                
                {showActions && (
                  <div
                    className="absolute right-0 top-full z-10 mt-1 w-32 rounded-md border border-border bg-card shadow-lg"
                    data-icod-id="src_components_actioncard_tsx_c443">
                    {onPostpone && (
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          onPostpone(action);
                        }}
                        data-icod-id="src_components_actioncard_tsx_d52f">
                        <Clock className="h-3 w-3" data-icod-id="src_components_actioncard_tsx_039d" />
                        Postpone
                      </button>
                    )}
                    {onDismiss && (
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          onDismiss(action);
                        }}
                        data-icod-id="src_components_actioncard_tsx_1229">
                        <XCircle className="h-3 w-3" data-icod-id="src_components_actioncard_tsx_77a1" />
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {action.description && (
            <p
              className="mt-1 text-sm text-muted-foreground line-clamp-2"
              data-icod-id="src_components_actioncard_tsx_d48e">{action.description}</p>
          )}

          <div
            className="mt-2 flex flex-wrap items-center gap-2"
            data-icod-id="src_components_actioncard_tsx_f2b9">
            {/* Status badge */}
            <span
              className={cn('text-xs font-medium capitalize', statusInfo.color)}
              data-icod-id="src_components_actioncard_tsx_68d0">
              {statusInfo.label}
            </span>

            {/* Priority badge */}
            {action.priority && (
              <span
                className={cn('rounded-full border px-2 py-0.5 text-xs capitalize', priorityColor)}
                data-icod-id="src_components_actioncard_tsx_8aee">
                {action.priority}
              </span>
            )}

            {/* Category badge */}
            {action.category && action.category !== 'other' && (
              <span
                className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground"
                data-icod-id="src_components_actioncard_tsx_f67f">
                {action.category}
              </span>
            )}

            {/* Due date */}
            {action.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                )}
                data-icod-id="src_components_actioncard_tsx_db47">
                <Calendar className="h-3 w-3" data-icod-id="src_components_actioncard_tsx_6551" />
                {new Date(action.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {isOverdue && ' (overdue)'}
              </span>
            )}
          </div>

          {action.tags.length > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-1"
              data-icod-id="src_components_actioncard_tsx_c6fb">
              {action.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  data-icod-id={`src_components_actioncard_tsx_f35d_${tag}`}>
                  <Tag
                    className="h-2.5 w-2.5"
                    data-icod-id={`src_components_actioncard_tsx_ca9f_${tag}`} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {action.completedAt && (
            <p
              className="mt-2 text-xs text-muted-foreground"
              data-icod-id="src_components_actioncard_tsx_4277">
              Completed {new Date(action.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
