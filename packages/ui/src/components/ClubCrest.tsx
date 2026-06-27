import React from "react";

interface ClubCrestProps {
  size?: number;
  className?: string;
}

export function ClubCrest({ size = 48, className = "" }: ClubCrestProps) {
  return (
    <img
      src="/assets/logo.png"
      alt="Clube Atlético Tubarão"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
