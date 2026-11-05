import { useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { X, Filter } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  className?: string;
}

export default function TagFilter({ tags, selectedTags, onToggleTag, className }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) return null;

  const visibleTags = expanded ? tags : tags.slice(0, 5);
  const hasMore = tags.length > 5;

  return (
    <div
      className={cn('space-y-2', className)}
      data-icod-id="src_components_tagfilter_tsx_5da9">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_components_tagfilter_tsx_b664">
        <div
          className="flex items-center gap-1 text-sm font-medium text-foreground"
          data-icod-id="src_components_tagfilter_tsx_11d6">
          <Filter className="h-3 w-3" data-icod-id="src_components_tagfilter_tsx_361e" />
          Filter by tags
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedTags.forEach(onToggleTag)}
            data-icod-id="src_components_tagfilter_tsx_6752">
            <X className="mr-1 h-3 w-3" data-icod-id="src_components_tagfilter_tsx_df83" />
            Clear
          </Button>
        )}
      </div>
      <div
        className="flex flex-wrap gap-1"
        data-icod-id="src_components_tagfilter_tsx_b0a6">
        {visibleTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={cn(
              'rounded-full px-3 py-1 text-xs transition-colors',
              selectedTags.includes(tag)
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            data-icod-id={`src_components_tagfilter_tsx_7e9b_${tag}`}>
            {tag}
          </button>
        ))}

        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-muted/80"
            data-icod-id="src_components_tagfilter_tsx_6d19">
            +{tags.length - 5} more
          </button>
        )}
      </div>
    </div>
  );
}
