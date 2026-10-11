import React, { useEffect, useState } from 'react';

const LeafParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 15 leaf particles with randomized positions, sizes, and delays
    const newParticles = Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 15 + 10; // 10px to 25px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 12 + 8; // 8s to 20s
      const delay = Math.random() * -15; // Start immediately with randomized offsets
      
      // Use different shades of green leaves
      const leafTypes = [
        'path1', // Light Lime
        'path2', // Rich Green
        'path3'  // Emerald Green
      ];
      const type = leafTypes[Math.floor(Math.random() * leafTypes.length)];

      return {
        id: i,
        size,
        left,
        duration,
        delay,
        type
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="particle-container">
      {particles.map((p) => (
        <svg
          key={p.id}
          className="leaf-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {p.type === 'path1' && (
            <path
              d="M17 8C8 10 7 19 7 19C7 19 14 17 19 12C20.5 10.5 21 8 21 8C21 8 18.5 7.5 17 8Z"
              fill="#86efac"
              fillOpacity="0.4"
            />
          )}
          {p.type === 'path2' && (
            <path
              d="M2 22C2 22 7.5 19.5 9 18C14 13 12 6 12 6C12 6 9.5 5.5 8 7C3 12 2 22 2 22Z"
              fill="#22c55e"
              fillOpacity="0.3"
            />
          )}
          {p.type === 'path3' && (
            <path
              d="M12 2C6.5 2 2 6.5 2 12C2 15.5 4.5 18 6 19C7.5 17.5 11 11 11 11C11 11 17.5 7.5 19 6C18 4.5 15.5 2 12 2Z"
              fill="#10b981"
              fillOpacity="0.3"
            />
          )}
        </svg>
      ))}
    </div>
  );
};

export default LeafParticles;
