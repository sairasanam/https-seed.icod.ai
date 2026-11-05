import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Person, Action } from '../types';
import { User, Clock, Tag, Calendar, Sparkles } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  actions?: Action[];
  onClick?: (person: Person) => void;
  className?: string;
}

const categoryColors = {
  family: 'bg-accent/20 text-accent-foreground border-accent/30',
  friend: 'bg-primary/10 text-primary border-primary/20',
  colleague: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  mentor: 'bg-success/15 text-success border-success/25',
  mentee: 'bg-warning/20 text-warning border-warning/30',
  other: 'bg-muted/50 text-muted-foreground border-border/30',
};

export default function PersonCard({ person, actions, onClick, className }: PersonCardProps) {
  const daysSinceContact = person.lastContactDate
    ? Math.floor((Date.now() - new Date(person.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const pendingActions = actions?.filter(a => a.status === 'pending' || a.status === 'postponed') || [];
  const nextAction = pendingActions
    .filter(a => a.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  const categoryColor = person.category 
    ? categoryColors[person.category as keyof typeof categoryColors] 
    : categoryColors.other;

  return (
    <Card
      glass
      className={cn(
        'p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] group',
        className
      )}
      onClick={() => onClick?.(person)}
      data-icod-id="src_components_personcard_tsx_9f01">
      <div
        className="flex items-start justify-between"
        data-icod-id="src_components_personcard_tsx_c704">
        <div
          className="flex items-center gap-4"
          data-icod-id="src_components_personcard_tsx_2e7e">
          {/* Avatar with gradient ring */}
          <div className="relative" data-icod-id="src_components_personcard_tsx_1c78">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-success opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"
              data-icod-id="src_components_personcard_tsx_54d3" />
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-success/10 text-primary border border-primary/20 shadow-inner"
              data-icod-id="src_components_personcard_tsx_e9bd">
              <User className="h-7 w-7" data-icod-id="src_components_personcard_tsx_f8f2" />
            </div>
          </div>
          
          <div data-icod-id="src_components_personcard_tsx_b7b4">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_components_personcard_tsx_c3bc">
              <h3
                className="font-bold text-lg text-foreground"
                data-icod-id="src_components_personcard_tsx_7ebb">{person.name}</h3>
              {person.category && (
                <span
                  className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border', categoryColor)}
                  data-icod-id="src_components_personcard_tsx_19b3">
                  {person.category}
                </span>
              )}
            </div>
            <p
              className="text-sm text-muted-foreground font-medium mt-0.5"
              data-icod-id="src_components_personcard_tsx_fcd9">{person.relationship}</p>
          </div>
        </div>
        
        {daysSinceContact !== null && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
              daysSinceContact > 14 
                ? 'bg-warning/15 text-warning border border-warning/20' 
                : 'bg-muted/50 text-muted-foreground'
            )}
            data-icod-id="src_components_personcard_tsx_e381">
            <Clock className="h-3.5 w-3.5" data-icod-id="src_components_personcard_tsx_8575" />
            <span data-icod-id="src_components_personcard_tsx_9df0">{daysSinceContact}d</span>
          </div>
        )}
      </div>
      {/* Tags */}
      {person.tags.length > 0 && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          data-icod-id="src_components_personcard_tsx_287d">
          {person.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-secondary/20"
              data-icod-id={`src_components_personcard_tsx_451f_${tag}`}>
              <Tag
                className="h-3 w-3"
                data-icod-id={`src_components_personcard_tsx_8117_${tag}`} />
              {tag}
            </span>
          ))}
          {person.tags.length > 3 && (
            <span
              className="text-xs text-muted-foreground font-medium self-center"
              data-icod-id="src_components_personcard_tsx_d49e">
              +{person.tags.length - 3} more
            </span>
          )}
        </div>
      )}
      {/* Action stats */}
      <div
        className="mt-4 flex items-center justify-between pt-4 border-t border-border/20"
        data-icod-id="src_components_personcard_tsx_c5ab">
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-icod-id="src_components_personcard_tsx_2f90">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10"
            data-icod-id="src_components_personcard_tsx_cbd6">
            <Calendar
              className="h-3.5 w-3.5 text-primary"
              data-icod-id="src_components_personcard_tsx_5508" />
            <span className="font-medium" data-icod-id="src_components_personcard_tsx_7a58">{pendingActions.length} pending</span>
          </div>
        </div>
        
        {nextAction && (
          <div
            className="flex items-center gap-1.5 text-xs font-semibold text-accent"
            data-icod-id="src_components_personcard_tsx_65b5">
            <Sparkles className="h-3.5 w-3.5" data-icod-id="src_components_personcard_tsx_a733" />
            <span data-icod-id="src_components_personcard_tsx_4a7d">Next: {new Date(nextAction.dueDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
