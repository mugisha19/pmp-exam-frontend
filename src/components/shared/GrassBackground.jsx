/**
 * Abstract Background Component
 * Creates an elegant abstract background effect with purple/violet tones and animated dots
 */

import { useMemo } from 'react';

export const GrassBackground = () => {
  // Generate random positions for animated dots - colors matching white transparent background
  // Soft pastel colors that stand out beautifully on white
  const dotColorStyles = [
    'rgba(83, 98, 158, 0.5)', // #53629E - base color, soft blue-gray
    'rgba(120, 140, 200, 0.5)', // Lighter blue-gray
    'rgba(147, 112, 219, 0.5)', // Soft lavender/purple
    'rgba(100, 149, 237, 0.5)', // Soft cornflower blue
    'rgba(135, 206, 250, 0.5)', // Soft sky blue
    'rgba(176, 196, 222, 0.5)', // Light steel blue
  ];

  const dots = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      id: `dot-${i}`,
      size: Math.random() * 3 + 3, // 3-6px - increased size for visibility
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10, // 15-25s
      colorIndex: Math.floor(Math.random() * dotColorStyles.length),
    })), []
  );

  const sparkles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: `sparkle-${i}`,
      size: Math.random() * 2 + 2, // 2-4px - increased size
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 8 + Math.random() * 5, // 8-13s
    })), []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base white transparent background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(83, 98, 158, 0.02) 10px,
              rgba(83, 98, 158, 0.02) 20px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(120, 140, 200, 0.02) 10px,
              rgba(120, 140, 200, 0.02) 20px
            )
          `,
        }}
      />
      
      {/* Animated floating dots - reduced size and shadow */}
      <div className="absolute inset-0">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute rounded-full"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              backgroundColor: dotColorStyles[dot.colorIndex],
              animation: `floatDot ${dot.duration}s ease-in-out infinite`,
              animationDelay: `${dot.delay}s`,
              boxShadow: `0 0 ${Math.max(1, dot.size * 0.3)}px ${dotColorStyles[dot.colorIndex]}`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
      
      {/* Additional sparkle dots - increased visibility */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute rounded-full"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              animation: `floatDot ${sparkle.duration}s ease-in-out infinite`,
              animationDelay: `${sparkle.delay}s`,
              boxShadow: `0 0 ${Math.max(1, sparkle.size * 0.5)}px rgba(255, 255, 255, 0.5)`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
      
      {/* Floating orbs - soft colors matching white background */}
      <div 
        className="absolute top-20 right-20 w-40 h-40 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(120, 140, 200, 0.08)' }}
      />
      <div 
        className="absolute bottom-20 left-20 w-48 h-48 rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(147, 112, 219, 0.06)', animationDelay: '1s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
        style={{ backgroundColor: 'rgba(135, 206, 250, 0.05)', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-1/4 right-1/4 w-28 h-28 rounded-full blur-2xl"
        style={{ backgroundColor: 'rgba(83, 98, 158, 0.06)' }}
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full blur-2xl"
        style={{ backgroundColor: 'rgba(176, 196, 222, 0.05)' }}
      />
    </div>
  );
};

export default GrassBackground;
