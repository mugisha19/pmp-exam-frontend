/**
 * LearningIllustration Component
 * Person studying with books illustration
 */

export const LearningIllustration = () => {
  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-2xl mx-auto"
    >
      <defs>
        <linearGradient id="cube-face-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#C06C84" />
        </linearGradient>
        <linearGradient id="cube-face-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FACFE" />
          <stop offset="100%" stopColor="#00F2FE" />
        </linearGradient>
        <linearGradient id="cube-face-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F093FB" />
          <stop offset="100%" stopColor="#F5576C" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 3D Glass Cube */}
      <g transform="translate(300, 280)" filter="url(#glow)">
        {/* Top face */}
        <path
          d="M 0,-80 L 100,-40 L 0,0 L -100,-40 Z"
          fill="url(#cube-face-1)"
          opacity="0.9"
        />
        {/* Left face */}
        <path
          d="M -100,-40 L -100,80 L 0,120 L 0,0 Z"
          fill="url(#cube-face-2)"
          opacity="0.8"
        />
        {/* Right face */}
        <path
          d="M 0,0 L 0,120 L 100,80 L 100,-40 Z"
          fill="url(#cube-face-3)"
          opacity="0.85"
        />
      </g>

      {/* Glow effects */}
      <circle
        cx="300"
        cy="280"
        r="150"
        fill="url(#cube-face-2)"
        opacity="0.1"
      />
      <circle
        cx="280"
        cy="260"
        r="100"
        fill="url(#cube-face-1)"
        opacity="0.08"
      />
    </svg>
  );
};

export default LearningIllustration;
