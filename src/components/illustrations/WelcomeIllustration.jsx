/**
 * WelcomeIllustration Component
 * 3D cube illustration for login page
 */

export const WelcomeIllustration = () => {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient
          id="cube-gradient-1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#7c7cff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5a5aff" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient
          id="cube-gradient-2"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c44569" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="cube-gradient-3"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#44a08d" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* 3D Cube */}
      <g transform="translate(200, 200)">
        {/* Top face */}
        <path
          d="M 0,-80 L 70,-40 L 0,0 L -70,-40 Z"
          fill="url(#cube-gradient-2)"
          opacity="0.9"
        />
        {/* Left face */}
        <path
          d="M -70,-40 L -70,60 L 0,100 L 0,0 Z"
          fill="url(#cube-gradient-1)"
          opacity="0.8"
        />
        {/* Right face */}
        <path
          d="M 0,0 L 0,100 L 70,60 L 70,-40 Z"
          fill="url(#cube-gradient-3)"
          opacity="0.7"
        />
      </g>

      {/* Glow effect */}
      <circle
        cx="200"
        cy="200"
        r="120"
        fill="url(#cube-gradient-1)"
        opacity="0.1"
      />
    </svg>
  );
};

export default WelcomeIllustration;
