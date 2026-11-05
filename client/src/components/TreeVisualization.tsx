import { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TreeGrowthData } from '../types';
import { cn } from '@/utils/cn';

interface TreeVisualizationProps {
  growthData: TreeGrowthData;
  treeType?: 'inner' | 'community' | 'outer';
  className?: string;
  showLabels?: boolean;
}

// Premium color schemes for different tree types
const treeColors = {
  inner: { 
    trunk: '#0B3D30', 
    trunkLight: '#145A45',
    branch: '#087F5B', 
    leaf: ['#35D39A', '#2DB88A', '#45E6A8', '#28A67D'], // Varied shades
    glow: '#A4F3D1',
    accent: '#E6C47A',
    ambient: 'rgba(53, 211, 154, 0.15)'
  },
  community: { 
    trunk: '#0B3D30', 
    trunkLight: '#145A45',
    branch: '#087F5B', 
    leaf: ['#35D39A', '#E6C47A', '#4ADE80', '#86EFAC'], // Multi-color canopy
    glow: '#F6F0E5',
    accent: '#E6C47A',
    ambient: 'rgba(230, 196, 122, 0.15)'
  },
  outer: { 
    trunk: '#0B3D30', 
    trunkLight: '#145A45',
    branch: '#087F5B', 
    leaf: ['#2DD4BF', '#5EEAD4', '#99F6E4', '#14B8A6'], // Teal/mint palette
    glow: '#A4F3D1',
    accent: '#E6C47A',
    ambient: 'rgba(45, 212, 191, 0.15)'
  },
};

// Seeded random for consistent leaf placement
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Premium organic tree visualization with naturally curved trunk,
 * procedural branches, varied leaves, and floating particles.
 */
const TreeVisualization = memo(function TreeVisualization({
  growthData,
  treeType = 'inner',
  className = '',
  showLabels = true,
}: TreeVisualizationProps) {
  const { trunkSize, branches, totalLeaves } = growthData;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [prevLeafCount, setPrevLeafCount] = useState(totalLeaves);
  const [showNewLeafBurst, setShowNewLeafBurst] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Detect new leaf addition for burst animation
  useEffect(() => {
    if (totalLeaves > prevLeafCount && !prefersReducedMotion) {
      setShowNewLeafBurst(true);
      const timer = setTimeout(() => setShowNewLeafBurst(false), 1500);
      setPrevLeafCount(totalLeaves);
      return () => clearTimeout(timer);
    }
    setPrevLeafCount(totalLeaves);
  }, [totalLeaves, prevLeafCount, prefersReducedMotion]);

  const theme = treeColors[treeType];

  const transitionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] };

  const branchTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] };

  const leafTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, type: 'spring' as const, stiffness: 200, damping: 15 };

  // Generate organic trunk path using cubic bezier
  const trunkPath = useMemo(() => {
    const baseX = 200;
    const baseY = 360;
    const topY = 280 - trunkSize;
    const width = trunkSize / 2;
    
    // Natural curve with slight asymmetry
    const cp1x = baseX - width * 0.3;
    const cp1y = baseY - trunkSize * 0.4;
    const cp2x = baseX + width * 0.2;
    const cp2y = topY + trunkSize * 0.3;
    
    return `M ${baseX - width / 2},${baseY} 
            C ${cp1x},${cp1y} ${cp2x - width / 2},${cp2y} ${baseX - width / 3},${topY}
            L ${baseX + width / 3},${topY}
            C ${cp2x + width / 2},${cp2y} ${cp1x + width},${cp1y} ${baseX + width / 2},${baseY}
            Z`;
  }, [trunkSize]);

  // Generate floating particles based on growth level
  const particleCount = Math.min(12, Math.max(5, Math.ceil(totalLeaves / 4)));
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      startX: 100 + seededRandom(i * 17) * 200,
      startY: 150 + seededRandom(i * 23) * 150,
      size: 1 + seededRandom(i * 31) * 2,
      duration: 4 + seededRandom(i * 37) * 3,
      delay: i * 0.7,
      color: i % 3 === 0 ? theme.accent : theme.glow,
    }));
  }, [particleCount, theme.accent, theme.glow]);

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      data-icod-id="src_components_treevisualization_tsx_7b2c">
      {/* Ambient radial glow behind the tree - intensifies with growth */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ 
          background: `radial-gradient(circle at 50% 60%, ${theme.ambient} 0%, transparent 70%)`,
          opacity: 0.4 + Math.min(0.4, totalLeaves * 0.015),
          transform: `scale(${1 + Math.min(0.3, totalLeaves * 0.01)})`,
          transition: 'all 0.5s ease-out'
        }}
        data-icod-id="src_components_treevisualization_tsx_f838" />
      {/* Floating ambient particles */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          data-icod-id="src_components_treevisualization_tsx_e975">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.startX / 4}%`,
                top: `${p.startY / 4}%`,
                width: p.size * 2,
                height: p.size * 2,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
              animate={{
                y: [0, -60 - seededRandom(p.id * 41) * 40],
                x: [(seededRandom(p.id * 43) - 0.5) * 30],
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.3],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
      {/* New leaf burst animation */}
      <AnimatePresence>
        {showNewLeafBurst && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[rgb(var(--brand-gold))]"
                style={{
                  left: '50%',
                  top: '40%',
                  boxShadow: '0 0 8px rgba(230, 196, 122, 0.8)',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: (Math.cos(i * Math.PI / 4)) * 60,
                  y: (Math.sin(i * Math.PI / 4)) * 60,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[400px] h-auto relative z-10"
        data-icod-id="src_components_treevisualization_tsx_4467">
        <defs data-icod-id="src_components_treevisualization_tsx_5041">
          {/* Premium trunk gradient - dark bark to warm brown */}
          <linearGradient
            id={`trunk-gradient-${treeType}`}
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
            data-icod-id="src_components_treevisualization_tsx_6004">
            <stop
              offset="0%"
              stopColor={theme.trunk}
              data-icod-id="src_components_treevisualization_tsx_47e0" />
            <stop
              offset="50%"
              stopColor={theme.trunkLight}
              data-icod-id="src_components_treevisualization_tsx_7396" />
            <stop
              offset="100%"
              stopColor={theme.branch}
              data-icod-id="src_components_treevisualization_tsx_0e49" />
          </linearGradient>
          
          {/* Branch gradient with tapering effect */}
          <linearGradient
            id={`branch-gradient-${treeType}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            data-icod-id="src_components_treevisualization_tsx_281b">
            <stop
              offset="0%"
              stopColor={theme.trunk}
              data-icod-id="src_components_treevisualization_tsx_5a19" />
            <stop
              offset="100%"
              stopColor={theme.branch}
              data-icod-id="src_components_treevisualization_tsx_bc43" />
          </linearGradient>
          
          {/* Multiple leaf gradients for variety */}
          {theme.leaf.map((color, i) => (
            <radialGradient
              key={i}
              id={`leaf-gradient-${treeType}-${i}`}
              cx="40%"
              cy="40%"
              r="60%"
              data-icod-id={`src_components_treevisualization_tsx_a956_${i}`}>
              <stop
                offset="0%"
                stopColor={theme.glow}
                stopOpacity="0.9"
                data-icod-id={`src_components_treevisualization_tsx_b350_${i}`} />
              <stop
                offset="100%"
                stopColor={color}
                stopOpacity="0.85"
                data-icod-id={`src_components_treevisualization_tsx_b8f7_${i}`} />
            </radialGradient>
          ))}
          
          {/* Ambient glow gradient */}
          <radialGradient
            id={`ambient-glow-${treeType}`}
            cx="50%"
            cy="50%"
            r="50%"
            data-icod-id="src_components_treevisualization_tsx_3d8a">
            <stop
              offset="0%"
              stopColor={theme.glow}
              stopOpacity="0.2"
              data-icod-id="src_components_treevisualization_tsx_9ea3" />
            <stop
              offset="100%"
              stopColor={theme.glow}
              stopOpacity="0"
              data-icod-id="src_components_treevisualization_tsx_afe5" />
          </radialGradient>
          
          {/* Glow filter for hover effects */}
          <filter
            id={`glow-${treeType}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            data-icod-id="src_components_treevisualization_tsx_668c">
            <feGaussianBlur
              stdDeviation="4"
              result="coloredBlur"
              data-icod-id="src_components_treevisualization_tsx_5c30" />
            <feMerge data-icod-id="src_components_treevisualization_tsx_a178">
              <feMergeNode in="coloredBlur" data-icod-id="src_components_treevisualization_tsx_b478" />
              <feMergeNode
                in="SourceGraphic"
                data-icod-id="src_components_treevisualization_tsx_2672" />
            </feMerge>
          </filter>
          
          {/* Golden highlight filter */}
          <filter
            id={`gold-glow-${treeType}`}
            data-icod-id="src_components_treevisualization_tsx_adef">
            <feGaussianBlur
              stdDeviation="2"
              result="blur"
              data-icod-id="src_components_treevisualization_tsx_0d09" />
            <feFlood
              floodColor={theme.accent}
              floodOpacity="0.6"
              result="color"
              data-icod-id="src_components_treevisualization_tsx_e33e" />
            <feComposite
              in="color"
              in2="blur"
              operator="in"
              result="glow"
              data-icod-id="src_components_treevisualization_tsx_aee8" />
            <feMerge data-icod-id="src_components_treevisualization_tsx_53f6">
              <feMergeNode in="glow" data-icod-id="src_components_treevisualization_tsx_580f" />
              <feMergeNode
                in="SourceGraphic"
                data-icod-id="src_components_treevisualization_tsx_07fb" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Ambient background glow */}
        <circle
          cx="200"
          cy="220"
          r="160"
          fill={`url(#ambient-glow-${treeType})`}
          data-icod-id="src_components_treevisualization_tsx_15c0" />

        {/* Organic trunk with natural curve */}
        <motion.path
          d={trunkPath}
          fill={`url(#trunk-gradient-${treeType})`}
          initial={!prefersReducedMotion ? { scaleY: 0, opacity: 0 } : undefined}
          animate={!prefersReducedMotion ? { scaleY: 1, opacity: 1 } : undefined}
          transition={transitionConfig}
          style={{ transformOrigin: 'center bottom' }}
        />
        
        {/* Bark texture lines on trunk */}
        {!prefersReducedMotion && (
          <g opacity="0.15" data-icod-id="src_components_treevisualization_tsx_7d43">
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
              <motion.line
                key={i}
                x1={200 - trunkSize / 6}
                y1={360 - trunkSize * ratio}
                x2={200 + trunkSize / 6}
                y2={360 - trunkSize * ratio + 5}
                stroke={theme.trunk}
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
              />
            ))}
          </g>
        )}

        {/* Branches and Leaves */}
        <AnimatePresence mode="wait">
          {branches.map((branch, index) => {
            const angleRad = (branch.angle * Math.PI) / 180;
            const branchStartX = 200;
            const branchStartY = 280 - trunkSize * 0.7;
            const branchEndX = branchStartX + Math.cos(angleRad) * branch.length;
            const branchEndY = branchStartY - Math.sin(angleRad) * branch.length;
            const isHovered = hoveredBranch === branch.id;

            // Control point for organic curve
            const cpx = branchStartX + Math.cos(angleRad) * branch.length * 0.5 + (seededRandom(index * 7) - 0.5) * 20;
            const cpy = branchStartY - Math.sin(angleRad) * branch.length * 0.5 - 15;

            return (
              <motion.g
                key={branch.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                onMouseEnter={() => setHoveredBranch(branch.id)}
                onMouseLeave={() => setHoveredBranch(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Primary branch with organic curve */}
                <motion.path
                  d={`M${branchStartX},${branchStartY} Q${cpx},${cpy} ${branchEndX},${branchEndY}`}
                  stroke={`url(#branch-gradient-${treeType})`}
                  strokeWidth={Math.max(2, branch.leafCount * 0.6)}
                  strokeLinecap="round"
                  fill="none"
                  initial={!prefersReducedMotion ? { pathLength: 0, opacity: 0 } : undefined}
                  animate={!prefersReducedMotion ? { pathLength: 1, opacity: 1 } : undefined}
                  transition={{
                    ...branchTransition,
                    delay: prefersReducedMotion ? 0 : 0.5 + index * 0.1,
                  }}
                  filter={isHovered ? `url(#glow-${treeType})` : undefined}
                />
                {/* Secondary branches (smaller offshoots) */}
                {branch.leafCount > 3 && (
                  <>
                    <motion.path
                      d={`M${(branchStartX + branchEndX) / 2},${(branchStartY + branchEndY) / 2} 
                         Q${(branchStartX + branchEndX) / 2 + 15},${(branchStartY + branchEndY) / 2 - 20} 
                         ${(branchStartX + branchEndX) / 2 + 25},${(branchStartY + branchEndY) / 2 - 30}`}
                      stroke={theme.branch}
                      strokeWidth={Math.max(1, branch.leafCount * 0.3)}
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.7"
                      initial={!prefersReducedMotion ? { pathLength: 0 } : undefined}
                      animate={!prefersReducedMotion ? { pathLength: 1 } : undefined}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.8 + index * 0.1, duration: 0.5 }}
                    />
                  </>
                )}
                {/* Leaves with varied sizes and colors */}
                <AnimatePresence>
                  {Array.from({ length: Math.min(branch.leafCount, 12) }).map((_, leafIndex) => {
                    const leafSeed = index * 100 + leafIndex;
                    const leafAngle = angleRad + ((leafIndex - branch.leafCount / 2) * 0.2) + (seededRandom(leafSeed) - 0.5) * 0.3;
                    const leafDistance = branch.length * 0.4 + leafIndex * 8 + seededRandom(leafSeed + 1) * 15;
                    const leafX = branchStartX + Math.cos(leafAngle) * leafDistance;
                    const leafY = branchStartY - Math.sin(leafAngle) * leafDistance;
                    
                    // Varied leaf sizes (3-5 different sizes)
                    const sizeVariant = Math.floor(seededRandom(leafSeed + 2) * 5);
                    const leafSizes = [4, 5, 6, 7, 8];
                    const leafSize = leafSizes[sizeVariant];
                    
                    // Select gradient variant for color diversity
                    const gradientIndex = Math.floor(seededRandom(leafSeed + 3) * theme.leaf.length);
                    
                    // Random rotation for natural feel
                    const rotation = (seededRandom(leafSeed + 4) - 0.5) * 30;

                    return (
                      <motion.g key={`${branch.id}-leaf-${leafIndex}`}>
                        {/* Leaf glow on hover */}
                        <motion.circle
                          cx={leafX}
                          cy={leafY}
                          r={leafSize + 5}
                          fill={theme.glow}
                          opacity={0}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: isHovered ? 1.5 : 1, 
                            opacity: isHovered ? 0.25 : 0 
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        
                        {/* Main leaf shape (ellipse for more organic look) */}
                        <motion.ellipse
                          cx={leafX}
                          cy={leafY}
                          rx={leafSize}
                          ry={leafSize * 0.7}
                          fill={`url(#leaf-gradient-${treeType}-${gradientIndex})`}
                          transform={`rotate(${rotation}, ${leafX}, ${leafY})`}
                          initial={!prefersReducedMotion ? { scale: 0, opacity: 0 } : undefined}
                          animate={!prefersReducedMotion ? { scale: [0, 1.1, 1], opacity: 0.9 } : undefined}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            ...leafTransition,
                            delay: prefersReducedMotion ? 0 : 1 + index * 0.08 + leafIndex * 0.04,
                          }}
                          whileHover={!prefersReducedMotion ? { scale: 1.25 } : undefined}
                        />
                        
                        {/* Leaf vein detail */}
                        <motion.line
                          x1={leafX - leafSize * 0.5}
                          y1={leafY}
                          x2={leafX + leafSize * 0.5}
                          y2={leafY}
                          stroke={theme.trunk}
                          strokeWidth="0.5"
                          opacity="0.3"
                          transform={`rotate(${rotation}, ${leafX}, ${leafY})`}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: prefersReducedMotion ? 0 : 1.2 + index * 0.08 + leafIndex * 0.04, duration: 0.3 }}
                        />
                        
                        {/* Golden shimmer on newest leaves */}
                        {!prefersReducedMotion && leafIndex >= branch.leafCount - 2 && (
                          <motion.circle
                            cx={leafX - leafSize * 0.2}
                            cy={leafY - leafSize * 0.2}
                            r={leafSize * 0.35}
                            fill={theme.accent}
                            opacity={0}
                            animate={{ opacity: [0, 0.6, 0] }}
                            transition={{ 
                              duration: 2.5, 
                              repeat: Infinity, 
                              delay: 1.5 + index * 0.1 + leafIndex * 0.05,
                              ease: 'easeInOut'
                            }}
                          />
                        )}
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
                {/* Person/Entity indicator with tooltip */}
                {showLabels && branch.leafCount > 0 && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0.8 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 1.2 + index * 0.1 }}
                  >
                    {/* Indicator badge */}
                    <circle
                      cx={branchEndX}
                      cy={branchEndY - 20}
                      r={isHovered ? 15 : 13}
                      fill={isHovered ? theme.branch : theme.trunk}
                      stroke={theme.glow}
                      strokeWidth={isHovered ? 2 : 1}
                      opacity="0.95"
                      filter={isHovered ? `url(#gold-glow-${treeType})` : undefined}
                      data-icod-id={`src_components_treevisualization_tsx_bf5c_${branch.id}`} />
                    <text
                      x={branchEndX}
                      y={branchEndY - 16}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="9"
                      fontWeight="700"
                      data-icod-id={`src_components_treevisualization_tsx_6d5b_${branch.id}`}>
                      {branch.leafCount}
                    </text>
                    
                    {/* Name label with premium styling */}
                    <g
                      opacity={isHovered ? 1 : 0.85}
                      data-icod-id={`src_components_treevisualization_tsx_fe52_${branch.id}`}>
                      <rect
                        x={branchEndX - 35}
                        y={branchEndY + 4}
                        width="70"
                        height="18"
                        rx="9"
                        fill={theme.trunk}
                        opacity="0.85"
                        data-icod-id={`src_components_treevisualization_tsx_691f_${branch.id}`} />
                      <text
                        x={branchEndX}
                        y={branchEndY + 16}
                        textAnchor="middle"
                        fill={theme.glow}
                        fontSize="8"
                        fontWeight="600"
                        data-icod-id={`src_components_treevisualization_tsx_26a3_${branch.id}`}>
                        {branch.name.length > 12 ? `${branch.name.slice(0, 10)}...` : branch.name}
                      </text>
                    </g>
                    
                    {/* Tooltip on hover showing full name */}
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <rect
                          x={branchEndX - 50}
                          y={branchEndY - 55}
                          width="100"
                          height="28"
                          rx="8"
                          fill="rgb(var(--card))"
                          stroke={theme.glow}
                          strokeWidth="1"
                          data-icod-id={`src_components_treevisualization_tsx_7d67_${branch.id}`} />
                        <text
                          x={branchEndX}
                          y={branchEndY - 37}
                          textAnchor="middle"
                          fill="rgb(var(--foreground))"
                          fontSize="10"
                          fontWeight="600"
                          data-icod-id={`src_components_treevisualization_tsx_4a44_${branch.id}`}>
                          {branch.name}
                        </text>
                      </motion.g>
                    )}
                  </motion.g>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Center stats badge with premium styling */}
        <motion.g
          initial={!prefersReducedMotion ? { scale: 0, opacity: 0 } : undefined}
          animate={!prefersReducedMotion ? { scale: 1, opacity: 1 } : undefined}
          transition={{ delay: prefersReducedMotion ? 0 : 1.5, duration: 0.5, type: 'spring' }}
        >
          {/* Outer glow ring */}
          <circle
            cx="200"
            cy="340"
            r="28"
            fill="none"
            stroke={theme.glow}
            strokeWidth="1"
            opacity="0.3"
            data-icod-id="src_components_treevisualization_tsx_2b1c" />
          <circle
            cx="200"
            cy="340"
            r="25"
            fill={theme.trunk}
            opacity="0.95"
            data-icod-id="src_components_treevisualization_tsx_8d6c" />
          <circle
            cx="200"
            cy="340"
            r="23"
            fill="none"
            stroke={theme.leaf[0]}
            strokeWidth="1.5"
            opacity="0.6"
            data-icod-id="src_components_treevisualization_tsx_115f" />
          <text
            x="200"
            y="337"
            textAnchor="middle"
            fill="#fff"
            fontSize="15"
            fontWeight="700"
            data-icod-id="src_components_treevisualization_tsx_0826">
            {totalLeaves}
          </text>
          <text
            x="200"
            y="351"
            textAnchor="middle"
            fill={theme.glow}
            fontSize="7"
            fontWeight="500"
            data-icod-id="src_components_treevisualization_tsx_6405">
            {totalLeaves === 1 ? 'action' : 'actions'}
          </text>
        </motion.g>
      </svg>
    </div>
  );
});

export default TreeVisualization;
