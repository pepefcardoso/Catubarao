import React from "react";

interface ClubCrestProps {
  size?: number;
  className?: string;
}

export function ClubCrest({ size = 48, className = "" }: ClubCrestProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Club Crest Placeholder"
    >
      {/* TODO: replace with official brand asset SVG paths */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" fill="var(--brand-surface, #111827)" />
      <text x="50" y="55" fontSize="16" textAnchor="middle" fill="var(--brand-secondary, #eab308)" fontWeight="bold">
        CREST
      </text>
    </svg>
  );
}
