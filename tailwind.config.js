/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vanilla: '#FFF5E4', // Vanilla Cream
        butter: '#F4D99B', // Butter Yellow
        cocoa: '#593A2B', // Chocolate Brown
        strawberry: '#E8B4B8', // Strawberry Pink
        burnt: '#C96B42', // Burnt Orange
        beige: '#E8D8C3', // Warm Beige
        // Cookie-page palette
        blush: '#EBCDD4', // Blush pink
        cream: '#FFF8EF', // Warm cream
        choc: '#5C3A2E', // Chocolate brown
        rose: '#C98798', // Muted rose
        sage: '#A8B58A', // Soft matcha green
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hand: ['Caveat', '"Bradley Hand"', 'cursive'],
      },
      boxShadow: {
        paper: '0 14px 34px -14px rgba(89, 58, 43, 0.35)',
        soft: '0 6px 18px -8px rgba(89, 58, 43, 0.3)',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        bob: 'bob 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
