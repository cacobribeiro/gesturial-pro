import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        muted: '#64748b',
        surface: '#f8fafc',
        card: '#ffffff',
        accent: '#2563eb',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
