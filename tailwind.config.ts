import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vote: {
          yes: '#22c55e',      // green-500
          maybe: '#f59e0b',    // amber-500
          no: '#6b7280',       // gray-500 (neutral, not alarming)
        },
        consensus: {
          high: '#dcfce7',     // green-100
          medium: '#fef3c7',   // amber-100
          low: '#f3f4f6',      // gray-100
        }
      },
      animation: {
        'vote-pop': 'votePop 150ms ease-out',
        'pulse-once': 'pulseOnce 400ms ease-out',
        'spin-fast': 'spin 0.6s linear infinite',
      },
      keyframes: {
        votePop: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseOnce: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
