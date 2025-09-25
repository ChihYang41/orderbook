import React, { useMemo } from 'react';

interface Props {
  className?: string;
  direction?: 'up' | 'down';
  size?: number;
  color?: string;
}

const ArrowIcon: React.FC<Props> = React.memo(
  ({ className = '', color = '', direction = 'up', size = 12 }) => {
    const rotation = useMemo(() => (direction === 'up' ? 'rotate-180' : ''), [direction]);

    return (
      <svg
        className={`stroke-current ${rotation} ${color} ${className}`.trim()}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        role="presentation"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    );
  }
);

export default ArrowIcon;
