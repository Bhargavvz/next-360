/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        organic: '#16a34a',
        natural: '#d97706',
        eco: '#2563eb',
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter'],
      },
    },
  },
  plugins: [],
};
