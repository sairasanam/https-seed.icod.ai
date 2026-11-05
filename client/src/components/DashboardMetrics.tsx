import { useState, useEffect, memo } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { DashboardMetrics as DashboardMetricsType } from '../types';
import { TrendingUp, Leaf, Award, Flame, ArrowUp } from 'lucide-react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface DashboardMetricsProps {
  metrics: DashboardMetricsType;
  className?: string;
}

const metricConfig = [
  { key: 'actionsThisWeek', icon: TrendingUp, color: 'primary', label: 'This Week', sublabel: 'actions completed', gradient: 'from-primary/15 to-primary/5' },
  { key: 'streakDays', icon: Flame, color: 'accent', label: 'Streak', sublabel: 'days active', gradient: 'from-accent/15 to-accent/5' },
  { key: 'totalLeaves', icon: Leaf, color: 'success', label: 'Total Growth', sublabel: 'leaves earned', gradient: 'from-success/15 to-success/5' },
  { key: 'badges', icon: Award, color: 'primary', label: 'Badges', sublabel: 'milestones', gradient: 'from-primary/10 via-success/5 to-accent/10' },
];

/** Premium animated circular progress ring with gradient stroke and glow */
const ProgressRing = memo(function ProgressRing({ 
  value, 
  max, 
  size = 44, 
  strokeWidth = 3, 
  color,
  delay = 0
}: { 
  value: number; 
  max: number; 
  size?: number; 
  strokeWidth?: number; 
  color: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Color mapping for gradient stops
  const colorMap: Record<string, { start: string; end: string }> = {
    primary: { start: 'rgb(var(--brand-jade))', end: 'rgb(var(--primary))' },
    success: { start: 'rgb(var(--brand-jade))', end: 'rgb(var(--success))' },
    accent: { start: 'rgb(var(--brand-gold))', end: 'rgb(var(--accent))' },
  };
  
  const colors = colorMap[color] || colorMap.primary;
  const isComplete = percentage >= 100;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      data-icod-id="src_components_dashboardmetrics_tsx_f779">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        data-icod-id="src_components_dashboardmetrics_tsx_5187">
        <defs data-icod-id="src_components_dashboardmetrics_tsx_6e33">
          {/* Gradient for progress stroke */}
          <linearGradient
            id={`ring-gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            data-icod-id="src_components_dashboardmetrics_tsx_c3f7">
            <stop
              offset="0%"
              stopColor={colors.start}
              data-icod-id="src_components_dashboardmetrics_tsx_7e87" />
            <stop
              offset="100%"
              stopColor={colors.end}
              data-icod-id="src_components_dashboardmetrics_tsx_6e39" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter
            id={`ring-glow-${color}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            data-icod-id="src_components_dashboardmetrics_tsx_56df">
            <feGaussianBlur
              stdDeviation="2"
              result="blur"
              data-icod-id="src_components_dashboardmetrics_tsx_bbcd" />
            <feMerge data-icod-id="src_components_dashboardmetrics_tsx_df88">
              <feMergeNode in="blur" data-icod-id="src_components_dashboardmetrics_tsx_9671" />
              <feMergeNode
                in="SourceGraphic"
                data-icod-id="src_components_dashboardmetrics_tsx_6f1e" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
          data-icod-id="src_components_dashboardmetrics_tsx_52c3" />
        
        {/* Progress circle with gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#ring-gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={!prefersReducedMotion ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 1.5, 
            ease: [0.4, 0, 0.2, 1], 
            delay: prefersReducedMotion ? 0 : 0.3 + delay 
          }}
          filter={isComplete ? `url(#ring-glow-${color})` : undefined}
        />
        
        {/* Completion glow pulse when at 100% */}
        {isComplete && !prefersReducedMotion && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#ring-gradient-${color})`}
            strokeWidth={strokeWidth + 2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </svg>
    </div>
  );
});

/** Animated counting number display */
const AnimatedNumber = memo(function AnimatedNumber({ 
  value, 
  prefersReducedMotion 
}: { 
  value: number; 
  prefersReducedMotion: boolean;
}) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    duration: prefersReducedMotion ? 0 : 1200,
    bounce: 0 
  });
  const display = useTransform(springValue, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }
    
    motionValue.set(value);
    
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    
    return unsubscribe;
  }, [value, motionValue, display, prefersReducedMotion]);

  return (
    <span
      className="count-up"
      data-icod-id="src_components_dashboardmetrics_tsx_95ca">{displayValue}</span>
  );
});

const DashboardMetrics = memo(function DashboardMetrics({ metrics, className }: DashboardMetricsProps) {
  const totalLeaves = metrics.innerCircleGrowth.totalLeaves + metrics.communityGrowth.totalLeaves + metrics.outerCircleGrowth.totalLeaves;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  
  const getMetricValue = (key: string): number => {
    switch (key) {
      case 'actionsThisWeek': return metrics.actionsThisWeek;
      case 'streakDays': return metrics.streakDays;
      case 'totalLeaves': return totalLeaves;
      case 'badges': return metrics.milestones.length;
      default: return 0;
    }
  };

  const getMaxForMetric = (key: string, value: number): number => {
    switch (key) {
      case 'actionsThisWeek': return Math.max(10, value * 1.5);
      case 'streakDays': return Math.max(30, value * 1.2);
      case 'totalLeaves': return Math.max(50, value * 1.3);
      case 'badges': return Math.max(5, value * 1.5);
      default: return Math.max(10, value * 1.5);
    }
  };

  return (
    <div
      className={cn('grid grid-cols-2 gap-4', className)}
      data-icod-id="src_components_dashboardmetrics_tsx_3e70">
      {metricConfig.map((config, i) => {
        const Icon = config.icon;
        const value = getMetricValue(config.key);
        const max = getMaxForMetric(config.key, value);
        
        return (
          <motion.div
            key={config.key}
            initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : undefined}
            animate={!prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ 
              duration: 0.5, 
              delay: prefersReducedMotion ? 0 : i * 0.1,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <Card
              glass
              glow={i === 0}
              className={cn(
                'p-5 relative overflow-hidden group card-hover-lift',
                `bg-gradient-to-br ${config.gradient}`
              )}
              data-icod-id={`src_components_dashboardmetrics_tsx_76e4_${config.key}`}>
              {/* Decorative gradient blob with hover intensification */}
              <div
                className={cn(
                  `absolute -top-10 -right-10 w-24 h-24 rounded-full bg-${config.color}/10 blur-2xl`,
                  'opacity-50 group-hover:opacity-80 transition-opacity duration-500'
                )}
                data-icod-id={`src_components_dashboardmetrics_tsx_c822_${config.key}`} />
              
              <div
                className="relative z-10"
                data-icod-id={`src_components_dashboardmetrics_tsx_c97e_${config.key}`}>
                <div
                  className="flex items-center justify-between mb-3"
                  data-icod-id={`src_components_dashboardmetrics_tsx_581d_${config.key}`}>
                  <div
                    className="flex items-center gap-2.5"
                    data-icod-id={`src_components_dashboardmetrics_tsx_a870_${config.key}`}>
                    <div
                      className={cn(
                        `p-2 rounded-xl bg-${config.color}/10 border border-${config.color}/20`,
                        'transition-transform duration-300 group-hover:scale-110'
                      )}
                      data-icod-id={`src_components_dashboardmetrics_tsx_842c_${config.key}`}>
                      <Icon
                        className={cn(`h-5 w-5 text-${config.color}`)}
                        data-icod-id={`src_components_dashboardmetrics_tsx_dfad_${config.key}`} />
                    </div>
                    <span
                      className="text-sm font-bold text-foreground"
                      style={{ letterSpacing: 'var(--tracking-wide)' }}
                      data-icod-id={`src_components_dashboardmetrics_tsx_0d3a_${config.key}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  {/* Premium progress ring */}
                  <ProgressRing
                    value={value}
                    max={max}
                    size={36}
                    strokeWidth={2.5}
                    color={config.color}
                    delay={i * 0.1}
                    data-icod-id={`src_components_dashboardmetrics_tsx_2767_${config.key}`} />
                </div>
                
                <div
                  className="flex items-end justify-between"
                  data-icod-id={`src_components_dashboardmetrics_tsx_ccf8_${config.key}`}>
                  <div data-icod-id={`src_components_dashboardmetrics_tsx_af83_${config.key}`}>
                    <p
                      className="text-3xl font-bold text-foreground tracking-tight"
                      style={{ letterSpacing: 'var(--tracking-tight)' }}
                      data-icod-id={`src_components_dashboardmetrics_tsx_195a_${config.key}`}>
                      <AnimatedNumber
                        value={value}
                        prefersReducedMotion={prefersReducedMotion}
                        data-icod-id={`src_components_dashboardmetrics_tsx_3004_${config.key}`} />
                    </p>
                    <p
                      className="text-xs text-muted-foreground font-medium mt-1"
                      data-icod-id={`src_components_dashboardmetrics_tsx_6c24_${config.key}`}>
                      {config.sublabel}
                    </p>
                  </div>
                  
                  {/* Trend indicator */}
                  {value > 0 && (
                    <motion.div 
                      className="flex items-center gap-0.5 text-success text-xs font-semibold"
                      initial={!prefersReducedMotion ? { opacity: 0, y: 5 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.8 + i * 0.1 }}
                    >
                      <ArrowUp
                        className="h-3 w-3"
                        data-icod-id={`src_components_dashboardmetrics_tsx_705d_${config.key}`} />
                      <span data-icod-id={`src_components_dashboardmetrics_tsx_cde9_${config.key}`}>{Math.round((value / max) * 100)}%</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
});

export default DashboardMetrics;
