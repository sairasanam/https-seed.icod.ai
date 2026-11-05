import { useEffect, useState, memo } from 'react';
import { cn } from '@/utils/cn';

export type BackgroundVariant = 'home' | 'trees' | 'ai' | 'explore' | 'auth' | 'profile' | 'community' | 'splash' | 'brand' | 'premium' | 'default';

interface AnimatedBackgroundProps {
  variant?: BackgroundVariant;
  className?: string;
}

/** Delay (ms) before rendering heavy animated particles/orbs so initial paint is fast */
const ANIMATION_DEFER_MS = 300;

/**
 * Premium animated background component with different visual treatments
 * for each screen type. Uses CSS animations for performance.
 * Heavy animated elements are deferred to avoid blocking first paint.
 */
export default memo(function AnimatedBackground({ 
  variant = 'default', 
  className 
}: AnimatedBackgroundProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Defer heavy animations until after main content has painted
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationsReady(true);
      return;
    }
    let id: number | undefined;
    if (typeof requestIdleCallback === 'function') {
      id = requestIdleCallback(() => setAnimationsReady(true), { timeout: ANIMATION_DEFER_MS });
    } else {
      id = setTimeout(() => setAnimationsReady(true), ANIMATION_DEFER_MS) as unknown as number;
    }
    return () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [prefersReducedMotion]);

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'fixed inset-0 -z-10 bg-background',
          className
        )}
        data-icod-id="src_components_animatedbackground_tsx_5775">
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"
          data-icod-id="src_components_animatedbackground_tsx_3df2" />
      </div>
    );
  }

  return (
    <div
      className={cn('fixed inset-0 -z-10 overflow-hidden bg-background', className)}
      data-icod-id="src_components_animatedbackground_tsx_0b12">
      {/* Base gradient layer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"
        data-icod-id="src_components_animatedbackground_tsx_2227" />
      {/* Aurora gradient orbs — deferred for faster initial paint */}
      {animationsReady && (
        <>
          <div
            className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/8 blur-[100px] animate-blob opacity-60"
            data-icod-id="src_components_animatedbackground_tsx_54e3" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-success/8 blur-[80px] animate-blob opacity-50"
            style={{ animationDelay: '-4s' }}
            data-icod-id="src_components_animatedbackground_tsx_1aec" />
          <div
            className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-accent/6 blur-[90px] animate-blob opacity-40"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_1035" />
        </>
      )}
      {/* Variant-specific elements — also deferred */}
      {animationsReady && variant === 'home' && (
        <>
          {/* Floating golden particles for home */}
          <div
            className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-accent/40 animate-particle"
            data-icod-id="src_components_animatedbackground_tsx_2753" />
          <div
            className="absolute top-[35%] right-[20%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-particle"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_cfa8" />
          <div
            className="absolute top-[60%] left-[40%] w-1 h-1 rounded-full bg-accent/50 animate-particle"
            style={{ animationDelay: '-4s' }}
            data-icod-id="src_components_animatedbackground_tsx_fe81" />
          <div
            className="absolute top-[75%] right-[30%] w-2 h-2 rounded-full bg-primary/30 animate-particle"
            style={{ animationDelay: '-6s' }}
            data-icod-id="src_components_animatedbackground_tsx_e6b3" />
          {/* Additional depth layers */}
          <div
            className="absolute top-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-success/4 blur-[80px] animate-blob opacity-30"
            style={{ animationDelay: '-5s' }}
            data-icod-id="src_components_animatedbackground_tsx_home_depth1" />
          <div
            className="absolute bottom-[25%] left-[5%] w-3 h-3 rounded-full bg-accent/25 animate-float"
            style={{ animationDelay: '-1s' }}
            data-icod-id="src_components_animatedbackground_tsx_home_float1" />
        </>
      )}
      {animationsReady && variant === 'trees' && (
        <>
          {/* Gentle green glow for tree screens */}
          <div
            className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[70vw] h-[70vw] rounded-full bg-success/5 blur-[120px] animate-pulse-glow"
            data-icod-id="src_components_animatedbackground_tsx_0b30" />
          <div
            className="absolute bottom-[20%] left-[20%] w-3 h-3 rounded-full bg-success/30 animate-float"
            data-icod-id="src_components_animatedbackground_tsx_57b2" />
          <div
            className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-primary/40 animate-float"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_fa51" />
        </>
      )}
      {animationsReady && variant === 'ai' && (
        <>
          {/* Mystical aurora for AI assistant */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-accent/5 animate-aurora"
            data-icod-id="src_components_animatedbackground_tsx_fc12" />
          <div
            className="absolute top-[25%] left-[25%] w-2 h-2 rounded-full bg-accent/50 animate-particle"
            data-icod-id="src_components_animatedbackground_tsx_0630" />
          <div
            className="absolute top-[50%] right-[30%] w-1.5 h-1.5 rounded-full bg-primary/40 animate-particle"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_06d1" />
        </>
      )}
      {animationsReady && variant === 'explore' && (
        <>
          {/* Warm discovery atmosphere */}
          <div
            className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-accent/8 blur-[80px] animate-blob opacity-50"
            data-icod-id="src_components_animatedbackground_tsx_a13e" />
          <div
            className="absolute bottom-[15%] left-[10%] w-2 h-2 rounded-full bg-accent/30 animate-float"
            style={{ animationDelay: '-1s' }}
            data-icod-id="src_components_animatedbackground_tsx_36fb" />
        </>
      )}
      {animationsReady && variant === 'auth' && (
        <>
          {/* Elegant auth backdrop */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-success/5"
            data-icod-id="src_components_animatedbackground_tsx_5765" />
          <div
            className="absolute top-[15%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/6 blur-[100px] animate-blob opacity-40"
            data-icod-id="src_components_animatedbackground_tsx_e077" />
          <div
            className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-success/6 blur-[80px] animate-blob opacity-30"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_abdf" />
        </>
      )}
      {animationsReady && variant === 'profile' && (
        <>
          {/* Premium profile atmosphere with golden accents */}
          <div
            className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-accent/10 blur-[100px] animate-blob opacity-50"
            data-icod-id="src_components_animatedbackground_tsx_dbd9" />
          <div
            className="absolute bottom-[5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-primary/8 blur-[90px] animate-blob opacity-40"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_c3e1" />
          <div
            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-success/5 blur-[120px] animate-pulse-glow opacity-30"
            data-icod-id="src_components_animatedbackground_tsx_bbb8" />
          {/* Floating leaf particles */}
          <div
            className="absolute top-[25%] left-[20%] w-2 h-2 rounded-full bg-accent/40 animate-particle"
            data-icod-id="src_components_animatedbackground_tsx_4aab" />
          <div
            className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-particle"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_edd2" />
          <div
            className="absolute bottom-[30%] left-[35%] w-1 h-1 rounded-full bg-success/40 animate-float"
            style={{ animationDelay: '-4s' }}
            data-icod-id="src_components_animatedbackground_tsx_cbb3" />
        </>
      )}
      {animationsReady && variant === 'community' && (
        <>
          {/* Vibrant community atmosphere */}
          <div
            className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-success/10 blur-[100px] animate-blob opacity-50"
            data-icod-id="src_components_animatedbackground_tsx_2368" />
          <div
            className="absolute bottom-[-5%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/8 blur-[90px] animate-blob opacity-40"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_228f" />
          <div
            className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-primary/6 blur-[80px] animate-pulse-glow opacity-30"
            style={{ animationDelay: '-5s' }}
            data-icod-id="src_components_animatedbackground_tsx_cd09" />
          {/* Community energy particles */}
          <div
            className="absolute top-[20%] right-[30%] w-2 h-2 rounded-full bg-success/40 animate-particle"
            data-icod-id="src_components_animatedbackground_tsx_d189" />
          <div
            className="absolute top-[60%] left-[15%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-float"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_865c" />
        </>
      )}
      {animationsReady && variant === 'splash' && (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0B3D30] via-[#071A16] to-[#0B3D30]"
            data-icod-id="src_components_animatedbackground_tsx_splash_base" />
          <div
            className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/15 blur-[120px] animate-blob opacity-60"
            data-icod-id="src_components_animatedbackground_tsx_splash_orb1" />
          <div
            className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-success/12 blur-[100px] animate-blob opacity-50"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_splash_orb2" />
          {/* Golden floating particles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/50 animate-float-up"
              style={{
                left: `${20 + i * 15}%`,
                bottom: '10%',
                animationDelay: `${i * 1.2}s`,
              }}
              data-icod-id={`src_components_animatedbackground_tsx_splash_particle_${i}`} />
          ))}
        </>
      )}
      {animationsReady && variant === 'brand' && (
        <>
          <div
            className="absolute inset-0 bg-gradient-mesh animate-aurora-shift"
            data-icod-id="src_components_animatedbackground_tsx_brand_mesh" />
          <div
            className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] animate-pulse-glow-brand opacity-40"
            data-icod-id="src_components_animatedbackground_tsx_brand_glow1" />
          <div
            className="absolute bottom-[20%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-accent/8 blur-[90px] animate-blob opacity-30"
            style={{ animationDelay: '-4s' }}
            data-icod-id="src_components_animatedbackground_tsx_brand_glow2" />
          {/* Organic leaf shapes drifting */}
          <div
            className="absolute top-[30%] right-[25%] w-8 h-8 rounded-full bg-success/20 animate-float blur-sm"
            data-icod-id="src_components_animatedbackground_tsx_brand_leaf1" />
          <div
            className="absolute bottom-[40%] left-[30%] w-6 h-6 rounded-full bg-primary/15 animate-float blur-sm"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_brand_leaf2" />
        </>
      )}
      {animationsReady && variant === 'premium' && (
        <>
          {/* Layered aurora base */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-success/6 animate-aurora-shift-premium"
            data-icod-id="src_components_animatedbackground_tsx_premium_aurora" />
          
          {/* Multiple depth orbs */}
          <div
            className="absolute top-[-25%] left-[-15%] w-[70vw] h-[70vw] rounded-full bg-primary/12 blur-[120px] animate-blob opacity-60"
            data-icod-id="src_components_animatedbackground_tsx_premium_orb1" />
          <div
            className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-success/10 blur-[100px] animate-blob opacity-50"
            style={{ animationDelay: '-3s' }}
            data-icod-id="src_components_animatedbackground_tsx_premium_orb2" />
          <div
            className="absolute bottom-[-15%] left-[10%] w-[55vw] h-[55vw] rounded-full bg-accent/8 blur-[110px] animate-blob opacity-45"
            style={{ animationDelay: '-6s' }}
            data-icod-id="src_components_animatedbackground_tsx_premium_orb3" />
          <div
            className="absolute top-[50%] left-[40%] w-[45vw] h-[45vw] rounded-full bg-primary/6 blur-[90px] animate-pulse-glow opacity-35"
            style={{ animationDelay: '-2s' }}
            data-icod-id="src_components_animatedbackground_tsx_premium_orb4" />
          
          {/* Floating particle overlay */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`premium-particle-${i}`}
              className={cn(
                "absolute rounded-full",
                i % 2 === 0 ? "bg-accent/40" : "bg-primary/30"
              )}
              style={{
                width: `${3 + (i % 3) * 2}px`,
                height: `${3 + (i % 3) * 2}px`,
                left: `${10 + (i * 12)}%`,
                top: `${15 + (i * 10) % 70}%`,
                animationDelay: `${i * 0.8}s`,
              }}
              data-icod-id={`src_components_animatedbackground_tsx_premium_particle_${i}`}>
              <div
                className="w-full h-full rounded-full animate-float-particle"
                data-icod-id={`src_components_animatedbackground_tsx_0c65_${i}`} />
            </div>
          ))}
          
          {/* Subtle golden shimmer streaks */}
          <div
            className="absolute top-[30%] left-[20%] w-[200px] h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-shimmer-gold opacity-40 rotate-12"
            data-icod-id="src_components_animatedbackground_tsx_premium_shimmer1" />
          <div
            className="absolute bottom-[40%] right-[15%] w-[150px] h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent animate-shimmer-gold opacity-30 -rotate-6"
            style={{ animationDelay: '-1.5s' }}
            data-icod-id="src_components_animatedbackground_tsx_premium_shimmer2" />
        </>
      )}
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
        data-icod-id="src_components_animatedbackground_tsx_4f51" />
    </div>
  );
});
