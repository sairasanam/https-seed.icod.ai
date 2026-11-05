import { useState, useMemo, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface WeeklyActivityChartProps {
  /** Array of completed actions per day (last 7 days) */
  dailyCompletions?: number[];
  /** Monthly activity data for weekly/monthly toggle */
  monthlyActivity?: number[];
  className?: string;
}

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Premium animated area/line chart showing activity over time.
 * Uses real data only — shows empty state when no data available.
 */
const WeeklyActivityChart = memo(function WeeklyActivityChart({ 
  dailyCompletions, 
  monthlyActivity,
  className 
}: WeeklyActivityChartProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Use real data only — no hardcoded fallbacks
  const weeklyData = dailyCompletions || [];
  const monthlyData = monthlyActivity || [];
  
  const currentData = viewMode === 'weekly' ? weeklyData : monthlyData.slice(0, 30);
  const labels = viewMode === 'weekly' ? DAYS_SHORT : Array.from({ length: Math.min(30, monthlyData.length) }, (_, i) => `${i + 1}`);
  const fullLabels = viewMode === 'weekly' ? DAYS_FULL : Array.from({ length: Math.min(30, monthlyData.length) }, (_, i) => `Day ${i + 1}`);
  
  const hasData = currentData.length > 0 && currentData.some(v => v > 0);
  const max = Math.max(...currentData, 1);
  const total = currentData.reduce((a, b) => a + b, 0);
  const avg = currentData.length > 0 ? (total / currentData.length).toFixed(1) : '0';

  // SVG dimensions
  const svgWidth = 400;
  const svgHeight = 180;
  const paddingX = 30;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Generate smooth cubic bezier path
  const { linePath, areaPath, points } = useMemo(() => {
    if (!hasData || currentData.length === 0) {
      return { linePath: '', areaPath: '', points: [] };
    }

    const pointCoords = currentData.map((value, i) => {
      const x = paddingX + (i / Math.max(currentData.length - 1, 1)) * chartWidth;
      const y = paddingY + chartHeight - (value / max) * chartHeight;
      return { x, y, value };
    });

    // Build smooth cubic bezier path
    let d = `M ${pointCoords[0].x},${pointCoords[0].y}`;
    
    for (let i = 1; i < pointCoords.length; i++) {
      const prev = pointCoords[i - 1];
      const curr = pointCoords[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy1 = prev.y;
      const cpx2 = curr.x - (curr.x - prev.x) * 0.5;
      const cpy2 = curr.y;
      d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${curr.x},${curr.y}`;
    }

    // Area path (close to bottom)
    const areaD = `${d} L ${pointCoords[pointCoords.length - 1].x},${paddingY + chartHeight} L ${pointCoords[0].x},${paddingY + chartHeight} Z`;

    return { linePath: d, areaPath: areaD, points: pointCoords };
  }, [currentData, hasData, max, chartWidth, chartHeight]);

  // Animated counter hook
  const [displayTotal, setDisplayTotal] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayTotal(total);
      return;
    }
    
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayTotal(Math.round(start + (total - start) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [total, prefersReducedMotion]);

  return (
    <Card
      glass
      className={cn('p-5 overflow-hidden', className)}
      data-icod-id="src_components_weeklyactivitychart_tsx_29cc">
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between mb-4"
        data-icod-id="src_components_weeklyactivitychart_tsx_4c21">
        <div
          className="flex items-center gap-2"
          data-icod-id="src_components_weeklyactivitychart_tsx_dd39">
          <div
            className="p-1.5 rounded-lg bg-primary/10"
            data-icod-id="src_components_weeklyactivitychart_tsx_1d97">
            <BarChart3
              className="h-5 w-5 text-primary"
              data-icod-id="src_components_weeklyactivitychart_tsx_8413" />
          </div>
          <h3
            className="font-bold text-lg text-foreground"
            style={{ letterSpacing: 'var(--tracking-tight)' }}
            data-icod-id="src_components_weeklyactivitychart_tsx_3e06">
            Activity
          </h3>
        </div>
        
        {/* Weekly/Monthly Toggle */}
        <div
          className="flex items-center bg-muted/30 rounded-lg p-0.5"
          data-icod-id="src_components_weeklyactivitychart_tsx_821b">
          <button
            onClick={() => setViewMode('weekly')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
              viewMode === 'weekly' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            data-icod-id="src_components_weeklyactivitychart_tsx_bcb3">
            Week
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
              viewMode === 'monthly' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            data-icod-id="src_components_weeklyactivitychart_tsx_fad1">
            Month
          </button>
        </div>
      </div>
      {/* Chart Area */}
      <div
        className="relative h-48"
        data-icod-id="src_components_weeklyactivitychart_tsx_2457">
        {!hasData ? (
          /* Beautiful empty state */
          (<div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            data-icod-id="src_components_weeklyactivitychart_tsx_9c82">
            <div
              className="p-4 rounded-full bg-muted/20 mb-3"
              data-icod-id="src_components_weeklyactivitychart_tsx_3e13">
              <Calendar
                className="h-8 w-8 text-muted-foreground/50"
                data-icod-id="src_components_weeklyactivitychart_tsx_6d91" />
            </div>
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_components_weeklyactivitychart_tsx_bf94">No activity data yet</p>
            <p
              className="text-xs text-muted-foreground/60 mt-1"
              data-icod-id="src_components_weeklyactivitychart_tsx_8bb7">Complete actions to see your progress</p>
          </div>)
        ) : (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full"
            preserveAspectRatio="none"
            data-icod-id="src_components_weeklyactivitychart_tsx_05cb">
            <defs data-icod-id="src_components_weeklyactivitychart_tsx_139d">
              {/* Gradient fill for area */}
              <linearGradient
                id="chart-area-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
                data-icod-id="src_components_weeklyactivitychart_tsx_c526">
                <stop
                  offset="0%"
                  stopColor="rgb(var(--brand-jade))"
                  stopOpacity="0.4"
                  data-icod-id="src_components_weeklyactivitychart_tsx_8fc4" />
                <stop
                  offset="50%"
                  stopColor="rgb(var(--brand-emerald))"
                  stopOpacity="0.2"
                  data-icod-id="src_components_weeklyactivitychart_tsx_592c" />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--brand-jade))"
                  stopOpacity="0"
                  data-icod-id="src_components_weeklyactivitychart_tsx_9934" />
              </linearGradient>
              
              {/* Glow filter for line */}
              <filter
                id="chart-line-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
                data-icod-id="src_components_weeklyactivitychart_tsx_357f">
                <feGaussianBlur
                  stdDeviation="3"
                  result="blur"
                  data-icod-id="src_components_weeklyactivitychart_tsx_86d8" />
                <feMerge data-icod-id="src_components_weeklyactivitychart_tsx_f512">
                  <feMergeNode in="blur" data-icod-id="src_components_weeklyactivitychart_tsx_992d" />
                  <feMergeNode
                    in="SourceGraphic"
                    data-icod-id="src_components_weeklyactivitychart_tsx_e15d" />
                </feMerge>
              </filter>
              
              {/* Grid pattern */}
              <pattern
                id="grid-pattern"
                width={chartWidth / 6}
                height={chartHeight / 4}
                patternUnits="userSpaceOnUse"
                data-icod-id="src_components_weeklyactivitychart_tsx_3594">
                <path
                  d={`M ${chartWidth / 6} 0 L 0 0 0 ${chartHeight / 4}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border/20"
                  data-icod-id="src_components_weeklyactivitychart_tsx_9238" />
              </pattern>
            </defs>

            {/* Subtle grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={paddingX}
                y1={paddingY + chartHeight * (1 - ratio)}
                x2={svgWidth - paddingX}
                y2={paddingY + chartHeight * (1 - ratio)}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/30"
                strokeDasharray="4 4"
                data-icod-id={`src_components_weeklyactivitychart_tsx_59d9_${i}`} />
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((ratio, i) => (
              <text
                key={i}
                x={paddingX - 8}
                y={paddingY + chartHeight * (1 - ratio) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[9px] font-medium"
                data-icod-id={`src_components_weeklyactivitychart_tsx_143c_${i}`}>
                {Math.round(max * ratio)}
              </text>
            ))}

            <AnimatePresence mode="wait">
              {/* Area fill with gradient */}
              <motion.path
                key={`area-${viewMode}`}
                d={areaPath}
                fill="url(#chart-area-gradient)"
                initial={!prefersReducedMotion ? { opacity: 0 } : undefined}
                animate={!prefersReducedMotion ? { opacity: 1 } : undefined}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {/* Glowing line */}
              <motion.path
                key={`line-${viewMode}`}
                d={linePath}
                fill="none"
                stroke="rgb(var(--brand-jade))"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#chart-line-glow)"
                initial={!prefersReducedMotion ? { pathLength: 0, opacity: 0 } : undefined}
                animate={!prefersReducedMotion ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
              />
            </AnimatePresence>

            {/* Interactive data points */}
            {points.map((point, i) => (
              <g key={i} data-icod-id={`src_components_weeklyactivitychart_tsx_a547_${i}`}>
                {/* Hover target (larger invisible circle) */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={12}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  data-icod-id={`src_components_weeklyactivitychart_tsx_a3e4_${i}`} />
                
                {/* Visible dot */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === i ? 6 : 4}
                  fill="rgb(var(--card))"
                  stroke="rgb(var(--brand-jade))"
                  strokeWidth="2"
                  initial={!prefersReducedMotion ? { scale: 0 } : undefined}
                  animate={!prefersReducedMotion ? { scale: 1 } : undefined}
                  transition={{ 
                    delay: 0.8 + i * 0.05, 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 20 
                  }}
                  className="transition-all duration-200"
                  style={{ 
                    filter: hoveredIndex === i ? 'drop-shadow(0 0 6px rgba(var(--brand-jade) / 0.6))' : 'none'
                  }}
                />

                {/* Tooltip on hover */}
                {hoveredIndex === i && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <rect
                      x={point.x - 28}
                      y={point.y - 36}
                      width="56"
                      height="28"
                      rx="6"
                      fill="rgb(var(--card))"
                      stroke="rgb(var(--border))"
                      strokeWidth="1"
                      className="shadow-lg"
                      data-icod-id={`src_components_weeklyactivitychart_tsx_331e_${i}`} />
                    <text
                      x={point.x}
                      y={point.y - 24}
                      textAnchor="middle"
                      className="fill-foreground text-[11px] font-bold"
                      data-icod-id={`src_components_weeklyactivitychart_tsx_4706_${i}`}>
                      {point.value} actions
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 13}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[8px]"
                      data-icod-id={`src_components_weeklyactivitychart_tsx_c04d_${i}`}>
                      {fullLabels[i]}
                    </text>
                  </motion.g>
                )}
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, i) => {
              // Show fewer labels for monthly view
              if (viewMode === 'monthly' && i % 5 !== 0) return null;
              return (
                <text
                  key={i}
                  x={point.x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-medium"
                  data-icod-id={`src_components_weeklyactivitychart_tsx_e844_${i}`}>
                  {labels[i]}
                </text>
              );
            })}
          </svg>
        )}
      </div>
      {/* Summary stats with animated counters */}
      <div
        className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-4"
        data-icod-id="src_components_weeklyactivitychart_tsx_4f2f">
        <div
          className="text-center"
          data-icod-id="src_components_weeklyactivitychart_tsx_fa6d">
          <div
            className="flex items-center justify-center gap-1 text-muted-foreground mb-1"
            data-icod-id="src_components_weeklyactivitychart_tsx_1740">
            <TrendingUp
              className="h-3.5 w-3.5"
              data-icod-id="src_components_weeklyactivitychart_tsx_9ef8" />
            <span
              className="text-xs font-medium"
              data-icod-id="src_components_weeklyactivitychart_tsx_d82c">Total</span>
          </div>
          <p
            className="text-xl font-bold text-foreground count-up"
            data-icod-id="src_components_weeklyactivitychart_tsx_fbd0">{displayTotal}</p>
        </div>
        <div
          className="text-center"
          data-icod-id="src_components_weeklyactivitychart_tsx_d16c">
          <div
            className="flex items-center justify-center gap-1 text-muted-foreground mb-1"
            data-icod-id="src_components_weeklyactivitychart_tsx_30ec">
            <BarChart3
              className="h-3.5 w-3.5"
              data-icod-id="src_components_weeklyactivitychart_tsx_b817" />
            <span
              className="text-xs font-medium"
              data-icod-id="src_components_weeklyactivitychart_tsx_bea0">Average</span>
          </div>
          <p
            className="text-xl font-bold text-foreground count-up"
            data-icod-id="src_components_weeklyactivitychart_tsx_555f">{avg}</p>
        </div>
        <div
          className="text-center"
          data-icod-id="src_components_weeklyactivitychart_tsx_c1c6">
          <div
            className="flex items-center justify-center gap-1 text-muted-foreground mb-1"
            data-icod-id="src_components_weeklyactivitychart_tsx_79ae">
            <Calendar
              className="h-3.5 w-3.5"
              data-icod-id="src_components_weeklyactivitychart_tsx_613e" />
            <span
              className="text-xs font-medium"
              data-icod-id="src_components_weeklyactivitychart_tsx_12b4">Peak</span>
          </div>
          <p
            className="text-xl font-bold text-foreground count-up"
            data-icod-id="src_components_weeklyactivitychart_tsx_228a">{max}</p>
        </div>
      </div>
    </Card>
  );
});

export default WeeklyActivityChart;
