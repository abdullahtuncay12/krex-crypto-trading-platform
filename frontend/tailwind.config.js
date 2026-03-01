/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Binance-style dark theme colors
        'crypto-dark': {
          900: '#0B0E11',  // Darkest background
          800: '#181A20',  // Main background
          700: '#1E2329',  // Card background
          600: '#2B3139',  // Hover states
          500: '#474D57',  // Borders
        },
        'crypto-yellow': {
          500: '#F0B90B',  // Binance yellow
          600: '#F8D12F',
        },
        buy: '#0ECB81',    // Green for buy/long
        sell: '#F6465D',   // Red for sell/short
        hold: '#F0B90B',   // Yellow for hold
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
