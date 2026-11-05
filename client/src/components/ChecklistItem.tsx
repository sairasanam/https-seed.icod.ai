import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Check, Trash2 } from 'lucide-react';
import type { InitiativeTask } from '@/types';

interface ChecklistItemProps {
  task: InitiativeTask;
  onToggle: (taskId: string) => void;
  onRemove?: (taskId: string) => void;
  className?: string;
}

export default function ChecklistItem({ task, onToggle, onRemove, className }: ChecklistItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border p-3 transition-colors',
        task.completed && 'bg-muted/50',
        className
      )}
      data-icod-id="src_components_checklistitem_tsx_2274">
      <button
        onClick={() => task._id && onToggle(task._id)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
          task.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40 hover:border-primary'
        )}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        data-icod-id="src_components_checklistitem_tsx_5e89">
        {task.completed && <Check className="h-3 w-3" data-icod-id="src_components_checklistitem_tsx_c391" />}
      </button>
      <span
        className={cn(
          'flex-1 text-sm',
          task.completed && 'text-muted-foreground line-through'
        )}
        data-icod-id="src_components_checklistitem_tsx_e55c">
        {task.title}
      </span>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => task._id && onRemove(task._id)}
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Remove task"
          data-icod-id="src_components_checklistitem_tsx_3710">
          <Trash2 className="h-3 w-3" data-icod-id="src_components_checklistitem_tsx_a1c0" />
        </Button>
      )}
    </div>
  );
}
