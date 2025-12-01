/**
 * VerifyIllustration Component
 * Email with checkmark
 */

export const VerifyIllustration = () => {
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
          id="verify-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#7c7cff" />
          <stop offset="100%" stopColor="#5a5aff" />
        </linearGradient>
      </defs>

      {/* Email envelope */}
      <rect
        x="100"
        y="140"
        width="200"
        height="140"
        rx="8"
        fill="url(#verify-gradient)"
        opacity="0.2"
      />
      <rect
        x="110"
        y="150"
        width="180"
        height="120"
        rx="6"
        fill="url(#verify-gradient)"
        opacity="0.8"
      />

      {/* Email flap */}
      <path
        d="M 110,150 L 200,220 L 290,150"
        stroke="#7c7cff"
        strokeWidth="3"
        fill="none"
      />

      {/* Checkmark circle */}
      <circle cx="250" cy="120" r="40" fill="#4ecdc4" opacity="0.9" />
      <path
        d="M 230,120 L 245,135 L 270,105"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="140" cy="110" r="3" fill="#7c7cff" opacity="0.8" />
      <circle cx="260" cy="260" r="4" fill="#4ecdc4" opacity="0.7" />
      <circle cx="310" cy="180" r="3" fill="#7c7cff" opacity="0.9" />
    </svg>
  );
};

export default VerifyIllustration;
