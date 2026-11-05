import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { LayoutDashboard, Users, Heart, BookOpen, Bell, ShieldCheck } from 'lucide-react';
import SeedsLogo from './SeedsLogo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/inner-circle', icon: Users, label: 'Inner' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/community', icon: Heart, label: 'Community' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
];

export default function BottomNavigation() {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Don't show on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const items = isAdmin
    ? [...navItems, { to: '/admin', icon: ShieldCheck, label: 'Admin' }]
    : navItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      role="navigation"
      aria-label="Main navigation"
      data-icod-id="src_components_bottomnavigation_tsx_2560">
      <div
        className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto relative"
        data-icod-id="src_components_bottomnavigation_tsx_7240">
        {/* Subtle brand watermark */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none"
          data-icod-id="src_components_bottomnavigation_tsx_9536">
          <SeedsLogo
            variant="symbol"
            theme="dark"
            size="xl"
            data-icod-id="src_components_bottomnavigation_tsx_0d65" />
        </div>
        
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-300 min-w-[60px] min-h-[52px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
            data-icod-id={`src_components_bottomnavigation_tsx_5984_${to}`}>
            {({ isActive }) => (
              <>
                {/* Active indicator background — refined pill shape with soft glow */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 shadow-[inset_0_0_12px_rgba(var(--glow-primary)/0.15)]"
                    transition={!prefersReducedMotion ? { type: 'spring', stiffness: 300, damping: 30 } : undefined}
                  />
                )}
                
                {/* Icon container */}
                <motion.div
                  className="relative z-10"
                  animate={!prefersReducedMotion && isActive ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : undefined}
                  transition={!prefersReducedMotion && isActive ? { duration: 0.4, ease: 'easeOut' } : undefined}
                  data-icod-id={`src_components_bottomnavigation_tsx_891c_${to}`}>
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(var(--glow-primary)/0.5)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
                    data-icod-id={`src_components_bottomnavigation_tsx_7dbc_${to}`} />
                  
                  {/* Glow dot for active state — refined pill/dot shape */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-primary via-success to-primary shadow-[0_0_10px_rgba(var(--glow-primary)/0.6)]"
                      initial={!prefersReducedMotion ? { scaleX: 0 } : undefined}
                      animate={!prefersReducedMotion ? { scaleX: 1 } : undefined}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  )}
                </motion.div>
                
                {/* Label */}
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-semibold tracking-wide transition-all",
                    isActive && "text-primary"
                  )}
                  style={{ letterSpacing: 'var(--tracking-wide)' }}
                  data-icod-id={`src_components_bottomnavigation_tsx_1901_${to}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
