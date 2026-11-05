import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Initiative } from '../types';
import ProgressBar from './ProgressBar';
import { Users, Calendar, TrendingUp, MapPin, FileText } from 'lucide-react';

interface InitiativeCardProps {
  initiative: Initiative;
  onClick?: (initiative: Initiative) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  planned: 'bg-secondary text-secondary-foreground',
  active: 'bg-accent/20 text-accent-foreground',
  completed: 'bg-primary/10 text-primary',
  archived: 'bg-muted text-muted-foreground',
};

export default function InitiativeCard({ initiative, onClick, className }: InitiativeCardProps) {
  const completedTasks = initiative.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = initiative.tasks?.length || 0;

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
        className
      )}
      onClick={() => onClick?.(initiative)}
      data-icod-id="src_components_initiativecard_tsx_af46">
      <div
        className="flex items-start justify-between"
        data-icod-id="src_components_initiativecard_tsx_ffbb">
        <div
          className="flex-1 min-w-0"
          data-icod-id="src_components_initiativecard_tsx_a49c">
          <div
            className="flex items-center gap-2 mb-1"
            data-icod-id="src_components_initiativecard_tsx_d9ed">
            <h3
              className="font-semibold text-foreground truncate"
              data-icod-id="src_components_initiativecard_tsx_f40e">{initiative.title}</h3>
            {initiative.template && (
              <span
                className="shrink-0 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground"
                data-icod-id="src_components_initiativecard_tsx_b86c">
                Template
              </span>
            )}
          </div>
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            data-icod-id="src_components_initiativecard_tsx_24a3">{initiative.description}</p>
        </div>
        <span
          className={cn('ml-2 shrink-0 rounded-full px-2 py-1 text-xs font-medium', statusColors[initiative.status] || statusColors.planned)}
          data-icod-id="src_components_initiativecard_tsx_1022">
          {initiative.status.replace('-', ' ')}
        </span>
      </div>
      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="mt-3" data-icod-id="src_components_initiativecard_tsx_81b6">
          <ProgressBar
            current={completedTasks}
            total={totalTasks}
            data-icod-id="src_components_initiativecard_tsx_5f9d" />
          <p
            className="mt-1 text-xs text-muted-foreground"
            data-icod-id="src_components_initiativecard_tsx_bb8a">
            {completedTasks}/{totalTasks} tasks
          </p>
        </div>
      )}
      <div
        className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
        data-icod-id="src_components_initiativecard_tsx_d757">
        <div
          className="flex items-center gap-1"
          data-icod-id="src_components_initiativecard_tsx_2495">
          <Users className="h-3 w-3" data-icod-id="src_components_initiativecard_tsx_47dd" />
          <span data-icod-id="src_components_initiativecard_tsx_47ed">{initiative.participants.length} participants</span>
        </div>
        {initiative.location && (
          <div
            className="flex items-center gap-1"
            data-icod-id="src_components_initiativecard_tsx_c4c6">
            <MapPin className="h-3 w-3" data-icod-id="src_components_initiativecard_tsx_32ae" />
            <span
              className="truncate max-w-[100px]"
              data-icod-id="src_components_initiativecard_tsx_16bb">{initiative.location}</span>
          </div>
        )}
        {initiative.frequency && (
          <div
            className="flex items-center gap-1"
            data-icod-id="src_components_initiativecard_tsx_01f0">
            <Calendar className="h-3 w-3" data-icod-id="src_components_initiativecard_tsx_e9c0" />
            <span data-icod-id="src_components_initiativecard_tsx_6039">{initiative.frequency}</span>
          </div>
        )}
        {initiative.impactLevel && (
          <div
            className="flex items-center gap-1"
            data-icod-id="src_components_initiativecard_tsx_0b45">
            <TrendingUp className="h-3 w-3" data-icod-id="src_components_initiativecard_tsx_e249" />
            <span data-icod-id="src_components_initiativecard_tsx_8df8">{initiative.impactLevel} impact</span>
          </div>
        )}
      </div>
      <div
        className="mt-2 flex items-center gap-2"
        data-icod-id="src_components_initiativecard_tsx_13a1">
        <span
          className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          data-icod-id="src_components_initiativecard_tsx_ce5e">
          {initiative.category}
        </span>
        {initiative.objectives && initiative.objectives.length > 0 && (
          <div
            className="flex items-center gap-1 text-xs text-muted-foreground"
            data-icod-id="src_components_initiativecard_tsx_b67c">
            <FileText className="h-3 w-3" data-icod-id="src_components_initiativecard_tsx_ab04" />
            <span data-icod-id="src_components_initiativecard_tsx_56b3">{initiative.objectives.length} objectives</span>
          </div>
        )}
      </div>
    </Card>
  );
}
