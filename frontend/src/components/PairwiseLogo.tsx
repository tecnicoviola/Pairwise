import React from 'react';

interface PairwiseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'full' | 'mark' | 'minimal';
  theme?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
}

export const PairwiseLogo: React.FC<PairwiseLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'light',
  className = '',
  showTagline = false,
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  const plumColor = theme === 'dark' ? '#FFFFFF' : '#482638';
  const roseColor = theme === 'dark' ? '#E5A4B2' : '#B87988';
  const circleBg = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F5EDE7';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#29242A';
  const subtitleColor = theme === 'dark' ? '#D6C7CC' : '#756A72';

  // The custom geometric SVG mark inspired by the reference:
  // Two complementary overlapping quadrant petals creating a harmonious central connection
  const LogoMark = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      aria-label="Pairwise Logo Mark"
    >
      {/* Background soft circular field */}
      <circle cx="50" cy="50" r="48" fill={circleBg} />

      {/* Primary Plum Petal (Left / Lower form) */}
      <path
        d="M 33 28 C 20 40 20 62 33 74 C 45 82 58 78 68 66 C 54 66 42 56 42 42 C 42 32 46 26 50 20 C 42 22 36 24 33 28 Z"
        fill={plumColor}
      />

      {/* Complementary Rose Petal (Right / Upper form) */}
      <path
        d="M 67 72 C 80 60 80 38 67 26 C 55 18 42 22 32 34 C 46 34 58 44 58 58 C 58 68 54 74 50 80 C 58 78 64 76 67 72 Z"
        fill={roseColor}
      />

      {/* Central harmonic aperture highlight */}
      <ellipse cx="50" cy="50" rx="6.5" ry="11" fill={circleBg} transform="rotate(32 50 50)" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {LogoMark}
      <div className="flex flex-col">
        <span
          className="font-serif tracking-tight font-bold leading-none"
          style={{
            color: textColor,
            fontSize: pixelSize >= 40 ? '1.5rem' : pixelSize >= 32 ? '1.25rem' : '1.1rem',
          }}
        >
          Pairwise
        </span>
        {(variant === 'full' || showTagline) && (
          <span
            className="text-[10px] uppercase font-semibold tracking-widest mt-1"
            style={{ color: subtitleColor }}
          >
            Human-First Matchmaking
          </span>
        )}
      </div>
    </div>
  );
};

export default PairwiseLogo;
