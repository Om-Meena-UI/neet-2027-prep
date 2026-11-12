// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lightSurface: '#F8FAFC',
        darkSurface: '#0B0F19',
        cardDark: '#111827',
        accentEmerald: '#34D399',
        accentIndigo: '#6366F1',
      },
    },
  },
  plugins: [],
};
