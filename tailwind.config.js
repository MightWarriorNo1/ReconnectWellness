/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
      },
      padding: {
        'safe-area-pb': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};
