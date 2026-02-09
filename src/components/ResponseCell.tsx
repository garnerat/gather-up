'use client';

import { useState, useEffect } from 'react';
import type { ResponseValue } from '@/types';

interface Props {
  value: ResponseValue;
  onChange?: (value: ResponseValue) => void;
  disabled?: boolean;
}

// Updated color scheme: gray for No (neutral), amber for Maybe, ghost outline for empty
const styles: Record<string, string> = {
  yes: 'bg-vote-yes text-white shadow-sm',
  no: 'bg-vote-no text-white shadow-sm',
  maybe: 'bg-vote-maybe text-white shadow-sm',
  empty: 'bg-transparent border-2 border-dashed border-gray-300 text-gray-400',
};

export function ResponseCell({ value, onChange, disabled }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const cycle: ResponseValue[] = [null, 'yes', 'maybe', 'no'];

  const handleClick = () => {
    if (disabled || !onChange) return;
    setIsAnimating(true);
    const next = cycle[(cycle.indexOf(value) + 1) % cycle.length];
    onChange(next);
  };

  // Reset animation state after animation completes
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const display = value === null ? '—' : value === 'yes' ? '✓' : value === 'no' ? '✗' : '?';
  const style = value === null ? styles.empty : styles[value];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-11 h-11 rounded-lg font-bold text-lg
        transition-all duration-150 ease-out
        ${style}
        ${isAnimating ? 'animate-vote-pop' : ''}
        ${disabled
          ? 'cursor-default opacity-70'
          : 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95'
        }
      `}
      aria-label={value === null ? 'No response' : value}
    >
      {display}
    </button>
  );
}
