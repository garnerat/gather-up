'use client';

type Value = 'yes' | 'no' | 'maybe' | null;

interface Props {
  value: Value;
  onChange?: (value: Value) => void;
  disabled?: boolean;
}

const styles: Record<string, string> = {
  yes: 'bg-green-500 text-white',
  no: 'bg-red-500 text-white',
  maybe: 'bg-yellow-400 text-black',
  empty: 'bg-gray-200 text-gray-400',
};

export function ResponseCell({ value, onChange, disabled }: Props) {
  const cycle: Value[] = [null, 'yes', 'maybe', 'no'];

  const handleClick = () => {
    if (disabled || !onChange) return;
    const next = cycle[(cycle.indexOf(value) + 1) % cycle.length];
    onChange(next);
  };

  const display = value === null ? '—' : value === 'yes' ? '✓' : value === 'no' ? '✗' : '?';
  const style = value === null ? styles.empty : styles[value];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-10 h-10 rounded font-bold ${style} ${
        disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
      }`}
    >
      {display}
    </button>
  );
}
