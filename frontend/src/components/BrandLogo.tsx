import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BrandLens AI Logo"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Outer Ring: Deep Navy Segment (Left & Bottom) */}
      <path
        d="M 43 7 A 36 36 0 1 0 68.46 68.46 L 60.68 60.68 A 25 25 0 1 1 43 18 Z"
        fill="#243A52"
      />

      {/* Handle extending down-right at 45 degrees */}
      <path
        d="M 66 58 L 83 75 C 86.5 78.5 86.5 84 83 87.5 C 79.5 91 74 91 70.5 87.5 L 53.5 70.5 Z"
        fill="#243A52"
      />

      {/* Outer Ring: Lighter Slate Blue Segment (Top-Right) */}
      <path
        d="M 43 7 A 36 36 0 0 1 68.46 68.46 L 60.68 60.68 A 25 25 0 0 0 43 18 Z"
        fill="#6E93B5"
      />

      {/* Triangular folded corner at 12 o'clock */}
      <path d="M 43 7 L 53 18 L 43 18 Z" fill="#E5EEF6" />

      {/* Center Pupil (Deep Navy) */}
      <circle cx="43" cy="43" r="16.5" fill="#162739" />

      {/* White Specular Reflection Highlight */}
      <circle cx="49" cy="37" r="3.8" fill="#FFFFFF" />
    </svg>
  );
};
