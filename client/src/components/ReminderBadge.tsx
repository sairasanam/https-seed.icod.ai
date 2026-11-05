import { Bell } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Reminder } from '../types';

interface ReminderBadgeProps {
  reminders: Reminder[];
  onClick?: (reminder: Reminder) => void;
  className?: string;
}

export default function ReminderBadge({ reminders, onClick, className }: ReminderBadgeProps) {
  if (reminders.length === 0) return null;

  return (
    <Card
      className={cn('p-3', className)}
      data-icod-id="src_components_reminderbadge_tsx_20c7">
      <div
        className="flex items-start gap-3"
        data-icod-id="src_components_reminderbadge_tsx_7791">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning"
          data-icod-id="src_components_reminderbadge_tsx_8c9d">
          <Bell className="h-4 w-4" data-icod-id="src_components_reminderbadge_tsx_8081" />
        </div>
        <div
          className="flex-1 min-w-0"
          data-icod-id="src_components_reminderbadge_tsx_5bbc">
          <p
            className="text-sm font-medium text-foreground"
            data-icod-id="src_components_reminderbadge_tsx_1866">
            {reminders.length} {reminders.length === 1 ? 'reminder' : 'reminders'}
          </p>
          <p
            className="text-xs text-muted-foreground truncate"
            data-icod-id="src_components_reminderbadge_tsx_d18d">
            {reminders[0].message}
          </p>
        </div>
      </div>
    </Card>
  );
}
