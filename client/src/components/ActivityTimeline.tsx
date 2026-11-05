import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { ActivityLog } from '../types';
import { 
  CheckCircle, 
  RotateCcw, 
  Clock, 
  XCircle, 
  Plus, 
  Edit,
  Calendar
} from 'lucide-react';

interface ActivityTimelineProps {
  logs: ActivityLog[];
  className?: string;
}

const typeConfig = {
  completed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Completed' },
  undone: { icon: RotateCcw, color: 'text-warning', bg: 'bg-warning/10', label: 'Undone' },
  postponed: { icon: Clock, color: 'text-accent-foreground', bg: 'bg-accent/20', label: 'Postponed' },
  dismissed: { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Dismissed' },
  created: { icon: Plus, color: 'text-primary', bg: 'bg-primary/10', label: 'Created' },
  updated: { icon: Edit, color: 'text-primary', bg: 'bg-primary/10', label: 'Updated' },
};

export default function ActivityTimeline({ logs, className }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div
        className={cn('py-8 text-center text-sm text-muted-foreground', className)}
        data-icod-id="src_components_activitytimeline_tsx_887d">No activity history yet
              </div>
    );
  }

  return (
    <div
      className={cn('space-y-4', className)}
      data-icod-id="src_components_activitytimeline_tsx_c6fa">
      {logs.map((log) => {
        const config = typeConfig[log.type];
        const Icon = config.icon;

        return (
          <div
            key={log._id}
            className="relative flex gap-3"
            data-icod-id={`src_components_activitytimeline_tsx_ef9e_${log._id}`}>
            {/* Timeline line */}
            <div
              className="absolute left-[19px] top-8 bottom-[-16px] w-px bg-border last:hidden"
              data-icod-id={`src_components_activitytimeline_tsx_fa24_${log._id}`} />
            {/* Icon */}
            <div
              className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.bg)}
              data-icod-id={`src_components_activitytimeline_tsx_3090_${log._id}`}>
              <Icon
                className={cn('h-5 w-5', config.color)}
                data-icod-id={`src_components_activitytimeline_tsx_6a9a_${log._id}`} />
            </div>
            {/* Content */}
            <Card
              className="flex-1 p-3"
              data-icod-id={`src_components_activitytimeline_tsx_8c87_${log._id}`}>
              <div
                className="flex items-start justify-between gap-2"
                data-icod-id={`src_components_activitytimeline_tsx_e2f0_${log._id}`}>
                <div data-icod-id={`src_components_activitytimeline_tsx_4df8_${log._id}`}>
                  <p
                    className="font-medium text-foreground"
                    data-icod-id={`src_components_activitytimeline_tsx_cc4c_${log._id}`}>{log.snapshot.title}</p>
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_components_activitytimeline_tsx_4f99_${log._id}`}>
                    <span
                      className={config.color}
                      data-icod-id={`src_components_activitytimeline_tsx_1440_${log._id}`}>{config.label}</span>
                    {log.previousStatus && log.type !== 'created' && (
                      <> · was {log.previousStatus}</>
                    )}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  data-icod-id={`src_components_activitytimeline_tsx_83e8_${log._id}`}>
                  <Calendar
                    className="h-3 w-3"
                    data-icod-id={`src_components_activitytimeline_tsx_c1d3_${log._id}`} />
                  {new Date(log.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {log.notes && (
                <p
                  className="mt-2 text-sm text-muted-foreground"
                  data-icod-id={`src_components_activitytimeline_tsx_1fcf_${log._id}`}>{log.notes}</p>
              )}
              
              {log.snapshot.dueDate && (
                <p
                  className="mt-1 text-xs text-muted-foreground"
                  data-icod-id={`src_components_activitytimeline_tsx_2332_${log._id}`}>
                  Due: {new Date(log.snapshot.dueDate).toLocaleDateString()}
                </p>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
