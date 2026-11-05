import { cn } from '@/utils/cn';

type LogoVariant = 'full' | 'symbol' | 'splash';
type LogoTheme = 'light' | 'dark' | 'gold';
type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface SeedsLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  className?: string;
}

const sizeMap = {
  sm: { symbol: 24, text: 16 },
  md: { symbol: 40, text: 24 },
  lg: { symbol: 56, text: 32 },
  xl: { symbol: 80, text: 48 },
};

/**
 * Seeds brand logo — original premium SVG design.
 * A stylized seedling emerging from a seed with heart-like leaf curves.
 */
export default function SeedsLogo({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className,
}: SeedsLogoProps) {
  const { symbol: symbolSize, text: textSize } = sizeMap[size];

  // Color schemes based on theme
  const colors = {
    light: {
      primary: '#FFFFFF',
      secondary: '#35D39A',
      accent: '#E6C47A',
      gradientStart: '#FFFFFF',
      gradientEnd: '#A4F3D1',
    },
    dark: {
      primary: '#0B3D30',
      secondary: '#35D39A',
      accent: '#E6C47A',
      gradientStart: '#0B3D30',
      gradientEnd: '#35D39A',
    },
    gold: {
      primary: '#E6C47A',
      secondary: '#D4AF37',
      accent: '#F6F0E5',
      gradientStart: '#E6C47A',
      gradientEnd: '#D4AF37',
    },
  };

  const palette = colors[theme];
  const uniqueId = `seeds-logo-${variant}-${size}`;

  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      data-icod-id="src_components_seedslogo_tsx_root"
    >
      {/* Symbol */}
      <svg
        width={symbolSize}
        height={symbolSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        data-icod-id="src_components_seedslogo_tsx_svg"
      >
        <defs data-icod-id="src_components_seedslogo_tsx_bbe4">
          {/* Main gradient for the seed/sprout */}
          <linearGradient
            id={`${uniqueId}-main`}
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
            data-icod-id="src_components_seedslogo_tsx_0b02">
            <stop
              offset="0%"
              stopColor={palette.gradientStart}
              data-icod-id="src_components_seedslogo_tsx_c9b1" />
            <stop
              offset="100%"
              stopColor={palette.gradientEnd}
              data-icod-id="src_components_seedslogo_tsx_e968" />
          </linearGradient>

          {/* Accent gradient for leaves */}
          <linearGradient
            id={`${uniqueId}-leaf`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            data-icod-id="src_components_seedslogo_tsx_63e9">
            <stop
              offset="0%"
              stopColor={palette.secondary}
              data-icod-id="src_components_seedslogo_tsx_7f7d" />
            <stop
              offset="100%"
              stopColor={palette.accent}
              data-icod-id="src_components_seedslogo_tsx_4adb" />
          </linearGradient>

          {/* Glow filter */}
          <filter
            id={`${uniqueId}-glow`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            data-icod-id="src_components_seedslogo_tsx_ed1b">
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
              data-icod-id="src_components_seedslogo_tsx_bda7" />
            <feComposite
              in="SourceGraphic"
              in2="blur"
              operator="over"
              data-icod-id="src_components_seedslogo_tsx_72a0" />
          </filter>

          {/* Inner shadow for depth */}
          <filter id={`${uniqueId}-depth`} data-icod-id="src_components_seedslogo_tsx_2b1f">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodOpacity="0.2"
              data-icod-id="src_components_seedslogo_tsx_ba92" />
          </filter>
        </defs>

        {/* Seed base — rounded teardrop shape */}
        <path
          d="M50 85 C35 85 25 72 25 58 C25 40 38 28 50 20 C62 28 75 40 75 58 C75 72 65 85 50 85Z"
          fill={`url(#${uniqueId}-main)`}
          opacity="0.9"
          filter={`url(#${uniqueId}-depth)`}
          data-icod-id="src_components_seedslogo_tsx_5188" />

        {/* Sprout stem emerging from seed */}
        <path
          d="M50 45 Q50 30 50 18"
          stroke={palette.secondary}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          data-icod-id="src_components_seedslogo_tsx_d027" />

        {/* Left leaf — heart-like curve suggesting care */}
        <path
          d="M50 28 Q38 18 28 22 Q20 28 25 38 Q32 42 50 28Z"
          fill={`url(#${uniqueId}-leaf)`}
          opacity="0.95"
          data-icod-id="src_components_seedslogo_tsx_43df" />

        {/* Right leaf — mirroring the heart shape */}
        <path
          d="M50 28 Q62 18 72 22 Q80 28 75 38 Q68 42 50 28Z"
          fill={`url(#${uniqueId}-leaf)`}
          opacity="0.95"
          data-icod-id="src_components_seedslogo_tsx_268b" />

        {/* Subtle vein detail on left leaf */}
        <path
          d="M50 28 Q40 24 32 30"
          stroke={palette.primary}
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
          data-icod-id="src_components_seedslogo_tsx_734e" />

        {/* Subtle vein detail on right leaf */}
        <path
          d="M50 28 Q60 24 68 30"
          stroke={palette.primary}
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
          data-icod-id="src_components_seedslogo_tsx_c263" />

        {/* Small highlight dot on seed for dimension */}
        <circle
          cx="42"
          cy="55"
          r="3"
          fill="white"
          opacity="0.25"
          data-icod-id="src_components_seedslogo_tsx_546e" />

        {/* Tiny sprouting bud at top */}
        <ellipse
          cx="50"
          cy="16"
          rx="3"
          ry="4"
          fill={palette.secondary}
          opacity="0.8"
          data-icod-id="src_components_seedslogo_tsx_f0ad" />
      </svg>
      {/* Wordmark for full and splash variants */}
      {(variant === 'full' || variant === 'splash') && (
        <span
          className={cn(
            'font-bold tracking-tight',
            theme === 'light' && 'text-white',
            theme === 'dark' && 'text-foreground',
            theme === 'gold' && 'text-[#E6C47A]'
          )}
          style={{ fontSize: textSize }}
          data-icod-id="src_components_seedslogo_tsx_wordmark"
        >
          Seeds
        </span>
      )}
      {/* Tagline for splash variant */}
      {variant === 'splash' && (
        <span
          className={cn(
            'block text-xs font-medium tracking-wide opacity-70 mt-1',
            theme === 'light' && 'text-white/80',
            theme === 'dark' && 'text-muted-foreground',
            theme === 'gold' && 'text-[#E6C47A]/80'
          )}
          style={{ fontSize: textSize * 0.4 }}
          data-icod-id="src_components_seedslogo_tsx_tagline"
        >
          Nurture · Grow · Connect
        </span>
      )}
    </div>
  );
}
