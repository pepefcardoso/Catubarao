import * as React from "react";

interface StadiumFillProps {
  fill: number; // percentage 0 to 100
}

export function StadiumFill({ fill }: StadiumFillProps) {
  const seatsToFill = Math.min(100, Math.floor(fill));
  const seats = Array.from({ length: 100 }, (_, i) => i);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg 
        viewBox="0 0 200 160" 
        className="w-full h-auto drop-shadow-sm" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Football pitch */}
        <rect x="30" y="40" width="140" height="80" rx="6" fill="#22c55e" opacity="0.2" className="dark:opacity-10" />
        <rect x="30" y="40" width="140" height="80" rx="6" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="80" r="15" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
        <line x1="100" y1="40" x2="100" y2="120" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
        <circle cx="100" cy="80" r="2" fill="#22c55e" opacity="0.4" />
        <rect x="30" y="60" width="10" height="40" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
        <rect x="160" y="60" width="10" height="40" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />

        {/* Top seats */}
        {seats.slice(0, 50).map((i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const isFilled = i < seatsToFill;
          return (
            <rect
              key={i}
              x={35 + col * 13}
              y={8 + row * 5}
              width="11"
              height="3.5"
              rx="1"
              fill="currentColor"
              className={isFilled ? "text-primary" : "text-muted"}
              style={{ transition: "color 0.5s ease" }}
            />
          );
        })}

        {/* Bottom seats */}
        {seats.slice(50, 100).map((i) => {
          const row = Math.floor((i - 50) / 10);
          const col = (i - 50) % 10;
          const isFilled = i < seatsToFill;
          return (
            <rect
              key={i}
              x={35 + col * 13}
              y={127 + row * 5}
              width="11"
              height="3.5"
              rx="1"
              fill="currentColor"
              className={isFilled ? "text-primary" : "text-muted"}
              style={{ transition: "color 0.5s ease" }}
            />
          );
        })}
      </svg>
    </div>
  );
}
