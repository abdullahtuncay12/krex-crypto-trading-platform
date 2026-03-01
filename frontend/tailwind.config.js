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
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1e 50%, #050510 100%)',
        'space-gradient-alt': 'radial-gradient(ellipse at bottom, #16213e 0%, #0f1419 50%, #0a0e14 100%)',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
