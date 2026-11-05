import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface StatusTabsProps {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
  className?: string;
}

export default function StatusTabs({ tabs, selected, onSelect, className }: StatusTabsProps) {
  return (
    <div
      className={cn('flex gap-1 overflow-x-auto pb-1 relative', className)}
      data-icod-id="src_components_statustabs_tsx_9a72">
      {tabs.map((tab) => {
        const isSelected = selected === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 relative overflow-hidden',
              isSelected
                ? 'text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            data-icod-id={`src_components_statustabs_tsx_45e8_${tab}`}>
            {/* Animated background for selected state */}
            {isSelected && (
              <motion.div
                layoutId="tab-background"
                className="absolute inset-0 bg-gradient-to-r from-primary to-success rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {/* Glow effect for selected tab */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 rounded-full opacity-50"
                style={{ boxShadow: '0 0 12px rgba(var(--glow-primary) / 0.4)' }}
                layoutId="tab-glow"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span
              className="relative z-10"
              data-icod-id={`src_components_statustabs_tsx_d71c_${tab}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
