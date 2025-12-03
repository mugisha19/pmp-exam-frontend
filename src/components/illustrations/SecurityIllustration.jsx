export const SecurityIllustration = () => {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto"
    >
      <defs>
        <linearGradient
          id="security-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#7c7cff" />
          <stop offset="100%" stopColor="#5a5aff" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M 200,80 L 280,120 L 280,200 Q 280,260 200,320 Q 120,260 120,200 L 120,120 Z"
        fill="url(#security-gradient)"
        opacity="0.2"
      />
      <path
        d="M 200,100 L 260,130 L 260,200 Q 260,245 200,290 Q 140,245 140,200 L 140,130 Z"
        fill="url(#security-gradient)"
        opacity="0.8"
      />

      {/* Lock */}
      <rect x="175" y="200" width="50" height="60" rx="8" fill="#7c7cff" />
      <path
        d="M 185,200 L 185,180 Q 185,160 200,160 Q 215,160 215,180 L 215,200"
        stroke="#7c7cff"
        strokeWidth="8"
        fill="none"
      />
      <circle cx="200" cy="230" r="8" fill="white" />

      {/* Glow */}
      <circle
        cx="200"
        cy="200"
        r="150"
        fill="url(#security-gradient)"
        opacity="0.05"
      />
    </svg>
  );
};

export default SecurityIllustration;
