/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      colors: {
        slate: {
          350: '#cbd5e1', // Using 300 equivalent as fallback or mid
          850: '#151e2e', // Between 800 and 900
        }
      }
    },
  },
  plugins: [],
}