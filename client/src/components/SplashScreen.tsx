import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SeedsLogo from './SeedsLogo';

interface SplashScreenProps {
  onComplete: () => void;
  /** When true, allows the splash to dismiss early once minimum display time has passed */
  ready?: boolean;
}

// Minimum time the splash is visible (ms) — reduced for fast initial render
const MIN_DISPLAY_MS = 300;
const MIN_DISPLAY_REDUCED_MS = 150;
// Fade-out duration (ms)
const FADE_OUT_MS = 200;
const FADE_OUT_REDUCED_MS = 100;

/**
 * Premium splash screen with aurora gradient, floating particles,
 * and smooth logo reveal animation. Respects prefers-reduced-motion.
 * Dismisses early if `ready` becomes true after minimum display time.
 */
export default function SplashScreen({ onComplete, ready = false }: SplashScreenProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const minTimeElapsed = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Mark minimum display time as elapsed
  useEffect(() => {
    const minMs = prefersReducedMotion ? MIN_DISPLAY_REDUCED_MS : MIN_DISPLAY_MS;
    const timer = setTimeout(() => {
      minTimeElapsed.current = true;
    }, minMs);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Dismiss logic: either max timeout or early-ready after minimum time
  useEffect(() => {
    const dismiss = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setIsVisible(false);
      const fadeMs = prefersReducedMotion ? FADE_OUT_REDUCED_MS : FADE_OUT_MS;
      setTimeout(onComplete, fadeMs);
    };

    // Max timeout — always dismiss after this even if not ready (reduced for fast render)
    const maxMs = prefersReducedMotion ? MIN_DISPLAY_REDUCED_MS + 100 : MIN_DISPLAY_MS + 300;
    const maxTimer = setTimeout(dismiss, maxMs);

    return () => clearTimeout(maxTimer);
  }, [onComplete, prefersReducedMotion]);

  // Early dismiss when ready becomes true AND minimum time has elapsed
  useEffect(() => {
    if (ready && minTimeElapsed.current && !completedRef.current) {
      if (completedRef.current) return;
      completedRef.current = true;
      setIsVisible(false);
      const fadeMs = prefersReducedMotion ? FADE_OUT_REDUCED_MS : FADE_OUT_MS;
      setTimeout(onComplete, fadeMs);
    }
  }, [ready, onComplete, prefersReducedMotion]);

  // Reduced motion: simple static version
  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_OUT_REDUCED_MS / 1000 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071A16]"
            data-icod-id="src_components_splashscreen_tsx_reduced"
          >
            <div
              className="flex flex-col items-center gap-4"
              data-icod-id="src_components_splashscreen_tsx_9c55">
              <SeedsLogo
                variant="splash"
                theme="light"
                size="xl"
                data-icod-id="src_components_splashscreen_tsx_4988" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#071A16]"
          data-icod-id="src_components_splashscreen_tsx_root"
        >
          {/* Aurora gradient background - slowly shifting */}
          <div
            className="absolute inset-0 animate-splash-aurora"
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(11, 61, 48, 0.8) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(53, 211, 154, 0.3) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 80%, rgba(230, 196, 122, 0.2) 0%, transparent 40%),
                linear-gradient(180deg, #071A16 0%, #0B3D30 50%, #071A16 100%)
              `,
            }}
            data-icod-id="src_components_splashscreen_tsx_aurora"
          />

          {/* Secondary aurora layer with different timing */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 70% 60%, rgba(53, 211, 154, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 30% 30%, rgba(230, 196, 122, 0.1) 0%, transparent 40%)
              `,
            }}
            data-icod-id="src_components_splashscreen_tsx_aurora_secondary"
          />

          {/* Floating golden particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#E6C47A]"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                left: `${20 + Math.random() * 60}%`,
                bottom: '-5%',
              }}
              animate={{
                y: [0, -window.innerHeight * 0.8],
                opacity: [0, 0.6, 0],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
              data-icod-id={`src_components_splashscreen_tsx_particle_${i}`}
            />
          ))}

          {/* Main content container */}
          <div
            className="relative z-10 flex h-full flex-col items-center justify-center"
            data-icod-id="src_components_splashscreen_tsx_3676">
            {/* Logo with spring animation */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 18,
                delay: 0.1,
                duration: 0.6,
              }}
              className="mb-6"
            >
              <SeedsLogo
                variant="symbol"
                theme="light"
                size="xl"
                data-icod-id="src_components_splashscreen_tsx_02a1" />
            </motion.div>

            {/* Wordmark with letter-by-letter reveal */}
            <div
              className="flex items-baseline gap-0.5 overflow-hidden"
              data-icod-id="src_components_splashscreen_tsx_0b56">
              {['S', 'e', 'e', 'd', 's'].map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.4 + i * 0.06,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="text-5xl font-bold text-white tracking-tight"
                  data-icod-id={`src_components_splashscreen_tsx_letter_${i}`}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Tagline fade-in */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-3 text-sm font-medium text-white/80 tracking-wide"
              data-icod-id="src_components_splashscreen_tsx_tagline"
            >
              Nurture · Grow · Connect
            </motion.p>

            {/* Subtle glow pulse behind logo */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#35D39A] blur-[80px] -z-10"
              data-icod-id="src_components_splashscreen_tsx_glow"
            />
          </div>

          {/* Seed-to-sprout SVG animation overlay */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-16 h-16 opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            data-icod-id="src_components_splashscreen_tsx_seed_anim"
          >
            {/* Animated seed outline */}
            <motion.path
              d="M50 80 C38 80 30 70 30 58 C30 42 40 32 50 25 C60 32 70 42 70 58 C70 70 62 80 50 80Z"
              fill="none"
              stroke="#35D39A"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
            />
            {/* Growing sprout line */}
            <motion.path
              d="M50 50 Q50 35 50 20"
              fill="none"
              stroke="#35D39A"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
