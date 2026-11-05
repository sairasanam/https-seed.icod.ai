import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface IllustrationProps {
  className?: string;
  size?: number;
}

const prefersReducedMotion = () => 
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Single seed with sprout, surrounded by soft circular rings — for Inner Circle empty state */
export function EmptyRelationshipsIllustration({ className, size = 140 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Outer ring */}
      <motion.circle
        cx="70"
        cy="70"
        r="65"
        stroke="rgb(var(--primary))"
        strokeWidth="1"
        strokeOpacity="0.2"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      {/* Middle ring */}
      <motion.circle
        cx="70"
        cy="70"
        r="50"
        stroke="rgb(var(--success))"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
      />
      {/* Inner glow circle */}
      <circle
        cx="70"
        cy="75"
        r="30"
        fill="rgb(var(--primary))"
        fillOpacity="0.08"
        data-icod-id="src_components_illustrations_tsx_df58" />
      {/* Seed body */}
      <motion.ellipse
        cx="70"
        cy="85"
        rx="12"
        ry="16"
        fill="rgb(var(--brand-emerald))"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      />
      {/* Sprout stem */}
      <motion.path
        d="M70 72 Q70 55 70 45"
        stroke="rgb(var(--success))"
        strokeWidth="3"
        strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
      />
      {/* Left leaf */}
      <motion.path
        d="M70 52 Q58 45 55 38 Q62 40 70 52"
        fill="rgb(var(--success))"
        initial={!reducedMotion ? { scale: 0, originX: '70px', originY: '52px' } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1, type: 'spring', stiffness: 150 }}
      />
      {/* Right leaf */}
      <motion.path
        d="M70 48 Q82 40 85 32 Q78 38 70 48"
        fill="rgb(var(--brand-jade))"
        initial={!reducedMotion ? { scale: 0, originX: '70px', originY: '48px' } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1.1, type: 'spring', stiffness: 150 }}
      />
      {/* Floating particles */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx="45"
            cy="50"
            r="2"
            fill="rgb(var(--accent))"
            animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="95"
            cy="45"
            r="1.5"
            fill="rgb(var(--success))"
            animate={{ y: [0, -6, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.circle
            cx="85"
            cy="65"
            r="2"
            fill="rgb(var(--brand-gold))"
            animate={{ y: [0, -5, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}
    </motion.svg>
  );
}

/** Hands holding a plant with community dots — for Community empty state */
export function EmptyInitiativesIllustration({ className, size = 140 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Background glow */}
      <circle
        cx="70"
        cy="70"
        r="55"
        fill="rgb(var(--success))"
        fillOpacity="0.06"
        data-icod-id="src_components_illustrations_tsx_9590" />
      {/* Left hand */}
      <motion.path
        d="M35 95 Q40 85 50 82 Q55 80 58 85 L62 90"
        stroke="rgb(var(--brand-emerald))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Right hand */}
      <motion.path
        d="M105 95 Q100 85 90 82 Q85 80 82 85 L78 90"
        stroke="rgb(var(--brand-emerald))"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
      />
      {/* Soil/base */}
      <motion.ellipse
        cx="70"
        cy="92"
        rx="18"
        ry="6"
        fill="rgb(var(--brand-emerald))"
        fillOpacity="0.6"
        initial={!reducedMotion ? { scaleX: 0 } : undefined}
        animate={!reducedMotion ? { scaleX: 1 } : undefined}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      {/* Plant stem */}
      <motion.path
        d="M70 88 Q70 65 70 45"
        stroke="rgb(var(--success))"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      />
      {/* Leaves */}
      <motion.path
        d="M70 60 Q55 50 50 40 Q60 48 70 60"
        fill="rgb(var(--success))"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 0.9, type: 'spring' }}
      />
      <motion.path
        d="M70 55 Q85 45 90 35 Q80 43 70 55"
        fill="rgb(var(--brand-jade))"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1, type: 'spring' }}
      />
      <motion.path
        d="M70 48 Q58 38 55 28 Q63 35 70 48"
        fill="rgb(var(--success))"
        fillOpacity="0.8"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1.1, type: 'spring' }}
      />
      {/* Community dots floating around */}
      {!reducedMotion && (
        <>
          <motion.circle cx="30" cy="45" r="4" fill="rgb(var(--accent))" fillOpacity="0.6"
            animate={{ y: [0, -5, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }} />
          <motion.circle cx="110" cy="40" r="3" fill="rgb(var(--primary))" fillOpacity="0.5"
            animate={{ y: [0, -6, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />
          <motion.circle cx="45" cy="30" r="2.5" fill="rgb(var(--brand-gold))" fillOpacity="0.7"
            animate={{ y: [0, -4, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} />
          <motion.circle cx="100" cy="55" r="3" fill="rgb(var(--success))" fillOpacity="0.5"
            animate={{ y: [0, -5, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 1.5 }} />
        </>
      )}
    </motion.svg>
  );
}

/** Globe with leaf markers — for Outer Circle empty state */
export function EmptyOrganizationsIllustration({ className, size = 140 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Globe outline */}
      <motion.circle
        cx="70"
        cy="70"
        r="50"
        stroke="rgb(var(--secondary))"
        strokeWidth="2"
        strokeOpacity="0.3"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      {/* Latitude lines */}
      <motion.ellipse cx="70" cy="70" rx="50" ry="20" stroke="rgb(var(--secondary))" strokeWidth="1" strokeOpacity="0.2"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, delay: 0.3 }} />
      <motion.ellipse cx="70" cy="70" rx="50" ry="35" stroke="rgb(var(--secondary))" strokeWidth="1" strokeOpacity="0.15"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, delay: 0.4 }} />
      {/* Longitude line */}
      <motion.ellipse cx="70" cy="70" rx="20" ry="50" stroke="rgb(var(--secondary))" strokeWidth="1" strokeOpacity="0.2"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, delay: 0.5 }} />
      {/* Leaf markers on globe */}
      <motion.g
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <path
          d="M55 55 Q50 48 48 42 Q53 47 55 55"
          fill="rgb(var(--success))"
          data-icod-id="src_components_illustrations_tsx_9dcf" />
        <path
          d="M85 50 Q90 43 93 37 Q88 42 85 50"
          fill="rgb(var(--brand-jade))"
          data-icod-id="src_components_illustrations_tsx_cf67" />
        <path
          d="M65 85 Q58 80 55 75 Q62 78 65 85"
          fill="rgb(var(--success))"
          fillOpacity="0.8"
          data-icod-id="src_components_illustrations_tsx_f17d" />
        <path
          d="M90 75 Q95 68 98 62 Q93 68 90 75"
          fill="rgb(var(--brand-jade))"
          fillOpacity="0.9"
          data-icod-id="src_components_illustrations_tsx_6784" />
      </motion.g>
      {/* Orbiting particle */}
      {!reducedMotion && (
        <motion.circle
          r="3"
          fill="rgb(var(--accent))"
          animate={{
            cx: [70 + 55 * Math.cos(0), 70 + 55 * Math.cos(Math.PI / 2), 70 + 55 * Math.cos(Math.PI), 70 + 55 * Math.cos(3 * Math.PI / 2)],
            cy: [70 + 55 * Math.sin(0), 70 + 55 * Math.sin(Math.PI / 2), 70 + 55 * Math.sin(Math.PI), 70 + 55 * Math.sin(3 * Math.PI / 2)],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.svg>
  );
}

/** Magnifying glass over wilting leaf — for search/filter empty states */
export function NoSearchResultsIllustration({ className, size = 140 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Magnifying glass circle */}
      <motion.circle
        cx="60"
        cy="60"
        r="35"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="3"
        strokeOpacity="0.4"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      
      {/* Glass handle */}
      <motion.line
        x1="85"
        y1="85"
        x2="110"
        y2="110"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.4"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      
      {/* Wilting leaf inside glass */}
      <motion.path
        d="M55 50 Q45 60 48 72 Q52 65 60 62 Q55 58 55 50"
        fill="rgb(var(--muted-foreground))"
        fillOpacity="0.3"
        initial={!reducedMotion ? { rotate: 0 } : undefined}
        animate={!reducedMotion ? { rotate: [0, 5, 0] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '55px 60px' }}
      />
      
      {/* Small fallen leaf */}
      <motion.path
        d="M70 78 Q65 82 68 88 Q72 84 70 78"
        fill="rgb(var(--accent))"
        fillOpacity="0.4"
        initial={!reducedMotion ? { y: 0, opacity: 0.4 } : undefined}
        animate={!reducedMotion ? { y: [0, 3, 0], opacity: [0.4, 0.6, 0.4] } : undefined}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.svg>
  );
}

/** Flourishing tree with golden leaves — celebration when all actions done */
export function CompletedActionsIllustration({ className, size = 160 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Ground */}
      <ellipse
        cx="80"
        cy="140"
        rx="50"
        ry="8"
        fill="rgb(var(--brand-emerald))"
        fillOpacity="0.15"
        data-icod-id="src_components_illustrations_tsx_8cdf" />
      {/* Trunk */}
      <motion.path
        d="M80 135 Q80 110 80 90 Q78 80 75 70"
        stroke="rgb(var(--brand-emerald))"
        strokeWidth="6"
        strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Branches */}
      <motion.path d="M78 85 Q60 70 50 55" stroke="rgb(var(--brand-emerald))" strokeWidth="3" strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.5, duration: 0.6 }} />
      <motion.path d="M80 80 Q100 65 110 50" stroke="rgb(var(--brand-emerald))" strokeWidth="3" strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.6, duration: 0.6 }} />
      <motion.path d="M76 72 Q65 55 55 40" stroke="rgb(var(--brand-emerald))" strokeWidth="2.5" strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.7, duration: 0.6 }} />
      <motion.path d="M82 68 Q95 50 105 35" stroke="rgb(var(--brand-emerald))" strokeWidth="2.5" strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.8, duration: 0.6 }} />
      {/* Leaf clusters */}
      <motion.g
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1, type: 'spring', stiffness: 100 }}
      >
        <circle
          cx="50"
          cy="52"
          r="12"
          fill="rgb(var(--success))"
          fillOpacity="0.7"
          data-icod-id="src_components_illustrations_tsx_c462" />
        <circle
          cx="110"
          cy="48"
          r="11"
          fill="rgb(var(--brand-jade))"
          fillOpacity="0.7"
          data-icod-id="src_components_illustrations_tsx_9e57" />
        <circle
          cx="55"
          cy="38"
          r="10"
          fill="rgb(var(--success))"
          fillOpacity="0.6"
          data-icod-id="src_components_illustrations_tsx_32b2" />
        <circle
          cx="105"
          cy="32"
          r="10"
          fill="rgb(var(--brand-jade))"
          fillOpacity="0.6"
          data-icod-id="src_components_illustrations_tsx_51a6" />
        <circle
          cx="78"
          cy="45"
          r="14"
          fill="rgb(var(--success))"
          fillOpacity="0.8"
          data-icod-id="src_components_illustrations_tsx_b4cc" />
        <circle
          cx="90"
          cy="40"
          r="12"
          fill="rgb(var(--brand-jade))"
          fillOpacity="0.7"
          data-icod-id="src_components_illustrations_tsx_5841" />
      </motion.g>
      {/* Floating golden leaves */}
      {!reducedMotion && (
        <>
          <motion.path d="M40 30 Q35 25 38 20 Q42 24 40 30" fill="rgb(var(--brand-gold))"
            animate={{ y: [0, -15, 0], x: [0, 5, 0], rotate: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M120 25 Q125 20 122 15 Q118 19 120 25" fill="rgb(var(--brand-gold))"
            animate={{ y: [0, -12, 0], x: [0, -4, 0], rotate: [0, -15, 0], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
          <motion.path d="M75 20 Q70 15 73 10 Q77 14 75 20" fill="rgb(var(--accent))"
            animate={{ y: [0, -10, 0], rotate: [0, 25, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
          <motion.circle cx="60" cy="25" r="2" fill="rgb(var(--brand-gold))"
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
          <motion.circle cx="100" cy="22" r="1.5" fill="rgb(var(--accent))"
            animate={{ y: [0, -6, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        </>
      )}
    </motion.svg>
  );
}

/** Open book with seedling growing from pages — for Journal empty state */
export function JournalEmptyIllustration({ className, size = 140 }: IllustrationProps) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('overflow-visible', className)}
      initial={!reducedMotion ? { opacity: 0, scale: 0.8 } : undefined}
      animate={!reducedMotion ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Book base shadow */}
      <ellipse
        cx="70"
        cy="110"
        rx="45"
        ry="6"
        fill="rgb(var(--brand-emerald))"
        fillOpacity="0.1"
        data-icod-id="src_components_illustrations_tsx_c79b" />
      {/* Left page */}
      <motion.path
        d="M30 100 Q30 60 35 50 L65 45 Q68 55 68 100 Z"
        fill="rgb(var(--card))"
        stroke="rgb(var(--border))"
        strokeWidth="1.5"
        initial={!reducedMotion ? { rotateY: -90 } : undefined}
        animate={!reducedMotion ? { rotateY: 0 } : undefined}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: '68px 75px' }}
      />
      {/* Right page */}
      <motion.path
        d="M110 100 Q110 60 105 50 L75 45 Q72 55 72 100 Z"
        fill="rgb(var(--card))"
        stroke="rgb(var(--border))"
        strokeWidth="1.5"
        initial={!reducedMotion ? { rotateY: 90 } : undefined}
        animate={!reducedMotion ? { rotateY: 0 } : undefined}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        style={{ transformOrigin: '72px 75px' }}
      />
      {/* Page lines (left) */}
      <line
        x1="40"
        y1="65"
        x2="60"
        y2="62"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_804e" />
      <line
        x1="38"
        y1="75"
        x2="62"
        y2="72"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_687e" />
      <line
        x1="36"
        y1="85"
        x2="64"
        y2="82"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_e009" />
      {/* Page lines (right) */}
      <line
        x1="80"
        y1="62"
        x2="100"
        y2="65"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_bf37" />
      <line
        x1="78"
        y1="72"
        x2="102"
        y2="75"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_2a34" />
      <line
        x1="76"
        y1="82"
        x2="104"
        y2="85"
        stroke="rgb(var(--muted-foreground))"
        strokeWidth="1"
        strokeOpacity="0.2"
        data-icod-id="src_components_illustrations_tsx_9f13" />
      {/* Book spine */}
      <path
        d="M68 45 L68 100 M72 45 L72 100"
        stroke="rgb(var(--brand-emerald))"
        strokeWidth="1"
        strokeOpacity="0.3"
        data-icod-id="src_components_illustrations_tsx_35eb" />
      {/* Seedling growing from center of book */}
      <motion.path
        d="M70 55 Q70 40 70 28"
        stroke="rgb(var(--success))"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={!reducedMotion ? { pathLength: 0 } : undefined}
        animate={!reducedMotion ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
      />
      {/* Seedling leaves */}
      <motion.path
        d="M70 35 Q60 28 58 22 Q65 27 70 35"
        fill="rgb(var(--success))"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1.2, type: 'spring' }}
      />
      <motion.path
        d="M70 30 Q80 22 83 16 Q76 22 70 30"
        fill="rgb(var(--brand-jade))"
        initial={!reducedMotion ? { scale: 0 } : undefined}
        animate={!reducedMotion ? { scale: 1 } : undefined}
        transition={{ delay: 1.3, type: 'spring' }}
      />
      {/* Tiny sparkles */}
      {!reducedMotion && (
        <>
          <motion.circle cx="55" cy="25" r="1.5" fill="rgb(var(--brand-gold))"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <motion.circle cx="88" cy="20" r="1" fill="rgb(var(--accent))"
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        </>
      )}
    </motion.svg>
  );
}
