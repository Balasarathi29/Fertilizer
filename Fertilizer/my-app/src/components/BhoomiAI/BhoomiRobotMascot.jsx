import React from 'react';

const BhoomiRobotMascot = ({ size = 80, state = 'idle', className = '' }) => {
  const isAnalyzing = state === 'analyzing' || state === 'thinking';
  const isHappy = state === 'happy';

  return (
    <div
      className={`bhoomi-robot-mascot ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: 'drop-shadow(0 8px 16px rgba(46, 125, 50, 0.2))',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna Stem */}
        <line x1="60" y1="28" x2="60" y2="16" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
        
        {/* Leaf Antenna Tip */}
        <path
          d="M60 16C55 10 60 4 60 4C60 4 65 10 60 16Z"
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="2"
        />

        {/* Head Shell */}
        <rect
          x="30"
          y="28"
          width="60"
          height="48"
          rx="18"
          fill="url(#headGradient)"
          stroke="#2E7D32"
          strokeWidth="3"
        />

        {/* Head Side Ears / Sensors */}
        <rect x="22" y="42" width="8" height="20" rx="4" fill="#C9A227" />
        <rect x="90" y="42" width="8" height="20" rx="4" fill="#C9A227" />

        {/* Dark Visor */}
        <rect x="38" y="38" width="44" height="24" rx="10" fill="#1B2E1E" />

        {/* Glowing Robot Eyes */}
        {isAnalyzing ? (
          <>
            <circle cx="48" cy="50" r="5" fill="#C9A227">
              <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="72" cy="50" r="5" fill="#C9A227">
              <animate attributeName="r" values="6;3;6" dur="1s" repeatCount="indefinite" />
            </circle>
          </>
        ) : isHappy ? (
          <>
            <path d="M44 52 Q48 44 52 52" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M68 52 Q72 44 76 52" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="48" cy="50" r="4.5" fill="#4CAF50" />
            <circle cx="72" cy="50" r="4.5" fill="#4CAF50" />
          </>
        )}

        {/* Robot Smile / Mouth Indicator */}
        <path
          d={isHappy ? "M52 64 Q60 70 68 64" : "M54 65 H66"}
          stroke={isHappy ? "#4CAF50" : "rgba(255,255,255,0.4)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body Chassis */}
        <path
          d="M38 78 H82 L76 104 C76 108 72 112 67 112 H53 C48 112 44 108 44 104 L38 78 Z"
          fill="url(#bodyGradient)"
          stroke="#2E7D32"
          strokeWidth="3"
        />

        {/* Chest Emblem: Leaf Accent */}
        <circle cx="60" cy="94" r="10" fill="#E8F5E9" stroke="#C9A227" strokeWidth="2" />
        <path d="M60 88 C56 92 60 98 60 98 C60 98 64 92 60 88 Z" fill="#2E7D32" />

        {/* Gradients */}
        <defs>
          <linearGradient id="headGradient" x1="30" y1="28" x2="90" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E8F5E9" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="38" y1="78" x2="82" y2="112" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E7D32" />
            <stop offset="1" stopColor="#1B5E20" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BhoomiRobotMascot;
