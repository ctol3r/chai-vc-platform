import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: { 500: '#6E77F1', 600: '#5A63E6' },
        cyan: { 400: '#22D3EE' },
        purple: { 500: '#7C3AED' },
        valid: { DEFAULT: '#16A34A' },
        revoked: { DEFAULT: '#F97316' },
        unknown: { DEFAULT: '#64748B' },
      },
      boxShadow: {
        glow: '0 0 0 2px rgba(34,211,238,.3), 0 0 40px rgba(124,58,237,.25)',
        glass: '0 1px 2px rgba(0,0,0,.25), 0 12px 32px rgba(0,0,0,.35)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur, 8px)',
      },
      borderColor: {
        glass: 'var(--glass-border, rgba(255,255,255,.08))',
      },
      backgroundImage: {
        'neon-accent': 'var(--accent)',
      },
      transitionTimingFunction: {
        springy: 'cubic-bezier(.16,1,.3,1)',
      },
    },
  },
  plugins: [],
};

export default config;
