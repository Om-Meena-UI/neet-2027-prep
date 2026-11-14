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
        darkBg: '#0e1013',
        darkCard: '#1a1d24',
        darkCardHover: '#222630',
        darkPill: '#262a34',
        accentLime: '#55e357',
        accentLimeHover: '#42ca44',
        accentOrange: '#f97316',
        accentCyan: '#38bdf8',
        borderDark: '#2c313d',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'sleek': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'glow-lime': '0 0 25px -5px rgba(85, 227, 87, 0.3)',
      }
    },
  },
  plugins: [],
};
