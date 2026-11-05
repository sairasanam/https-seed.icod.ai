import { cn } from '@/utils/cn';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'metric' | 'text' | 'circle' | 'tree' | 'card-detail';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ variant = 'card', count = 1, className }: SkeletonLoaderProps) {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Shimmer effect that respects reduced motion preference
  const shimmer = prefersReducedMotion 
    ? 'bg-muted/40' 
    : 'animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]';

  if (variant === 'metric') {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4', className)}
        data-icod-id="src_components_skeletonloader_tsx_748f">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/30 glass p-5"
            data-icod-id={`src_components_skeletonloader_tsx_f101_${i}`}>
            <div
              className={cn('h-4 w-20 rounded-lg', shimmer)}
              data-icod-id={`src_components_skeletonloader_tsx_ffdf_${i}`} />
            <div
              className={cn('mt-3 h-10 w-16 rounded-xl', shimmer)}
              data-icod-id={`src_components_skeletonloader_tsx_88f5_${i}`} />
            <div
              className={cn('mt-2 h-3 w-24 rounded-lg', shimmer)}
              data-icod-id={`src_components_skeletonloader_tsx_399f_${i}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={cn('space-y-4', className)}
        data-icod-id="src_components_skeletonloader_tsx_5899">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border/30 glass p-4 min-h-[72px]"
            data-icod-id={`src_components_skeletonloader_tsx_2917_${i}`}>
            <div
              className={cn('h-14 w-14 shrink-0 rounded-2xl', shimmer)}
              data-icod-id={`src_components_skeletonloader_tsx_28fe_${i}`} />
            <div
              className="flex-1 space-y-3"
              data-icod-id={`src_components_skeletonloader_tsx_e5fb_${i}`}>
              <div
                className={cn('h-5 w-3/4 rounded-lg', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_8ad2_${i}`} />
              <div
                className={cn('h-4 w-1/2 rounded-lg', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_6327_${i}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        data-icod-id="src_components_skeletonloader_tsx_7901">
        <div
          className={cn('h-72 w-72 rounded-full', shimmer)}
          data-icod-id="src_components_skeletonloader_tsx_c0a3" />
      </div>
    );
  }

  if (variant === 'tree') {
    return (
      <div
        className={cn('flex flex-col items-center justify-center gap-6 p-6', className)}
        data-icod-id="src_components_skeletonloader_tsx_243c">
        <div
          className={cn('h-56 w-56 rounded-full opacity-40', shimmer)}
          data-icod-id="src_components_skeletonloader_tsx_7069" />
        <div
          className={cn('h-5 w-40 rounded-xl', shimmer)}
          data-icod-id="src_components_skeletonloader_tsx_e291" />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div
        className={cn('space-y-3', className)}
        data-icod-id="src_components_skeletonloader_tsx_765e">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn('h-5 w-full rounded-xl', shimmer)}
            style={{ width: `${70 + Math.random() * 30}%` }}
            data-icod-id={`src_components_skeletonloader_tsx_9a11_${i}`} />
        ))}
      </div>
    );
  }

  if (variant === 'card-detail') {
    // Full detail page layout skeleton
    return (
      <div
        className={cn('space-y-6', className)}
        data-icod-id="src_components_skeletonloader_tsx_detail">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/30 glass p-6"
            data-icod-id={`src_components_skeletonloader_tsx_detail_${i}`}>
            {/* Header area */}
            <div
              className="flex items-start gap-4 mb-6"
              data-icod-id={`src_components_skeletonloader_tsx_f25e_${i}`}>
              <div
                className={cn('h-16 w-16 rounded-2xl shrink-0', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_2ab7_${i}`} />
              <div
                className="flex-1 space-y-3"
                data-icod-id={`src_components_skeletonloader_tsx_0338_${i}`}>
                <div
                  className={cn('h-7 w-3/4 rounded-xl', shimmer)}
                  data-icod-id={`src_components_skeletonloader_tsx_d953_${i}`} />
                <div
                  className={cn('h-4 w-1/2 rounded-lg', shimmer)}
                  data-icod-id={`src_components_skeletonloader_tsx_e048_${i}`} />
              </div>
            </div>
            {/* Content lines */}
            <div
              className="space-y-3"
              data-icod-id={`src_components_skeletonloader_tsx_3497_${i}`}>
              <div
                className={cn('h-4 w-full rounded-lg', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_af30_${i}`} />
              <div
                className={cn('h-4 w-5/6 rounded-lg', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_5681_${i}`} />
              <div
                className={cn('h-4 w-4/6 rounded-lg', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_45d3_${i}`} />
            </div>
            {/* Action buttons area */}
            <div
              className="flex gap-3 mt-6 pt-4 border-t border-border/20"
              data-icod-id={`src_components_skeletonloader_tsx_a443_${i}`}>
              <div
                className={cn('h-10 w-24 rounded-xl', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_de2e_${i}`} />
              <div
                className={cn('h-10 w-24 rounded-xl', shimmer)}
                data-icod-id={`src_components_skeletonloader_tsx_c31d_${i}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div
      className={cn('space-y-4', className)}
      data-icod-id="src_components_skeletonloader_tsx_accb">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/30 glass p-5"
          data-icod-id={`src_components_skeletonloader_tsx_2764_${i}`}>
          <div
            className={cn('h-6 w-2/3 rounded-xl', shimmer)}
            data-icod-id={`src_components_skeletonloader_tsx_0c85_${i}`} />
          <div
            className={cn('mt-4 h-4 w-full rounded-lg', shimmer)}
            data-icod-id={`src_components_skeletonloader_tsx_e2a3_${i}`} />
          <div
            className={cn('mt-3 h-4 w-4/5 rounded-lg', shimmer)}
            data-icod-id={`src_components_skeletonloader_tsx_7717_${i}`} />
        </div>
      ))}
    </div>
  );
}
