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
        // OpenClaw-inspired modern color palette
        'primary': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Main red accent
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'accent': {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#f0b90b',  // Crypto yellow
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Binance-style dark theme colors (keeping for compatibility)
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
        'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1e 50%, #050510 100%)',
        'space-gradient-alt': 'radial-gradient(ellipse at bottom, #16213e 0%, #0f1419 50%, #0a0e14 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
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
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(240, 185, 11, 0.5), 0 0 10px rgba(240, 185, 11, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(240, 185, 11, 0.8), 0 0 30px rgba(240, 185, 11, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(240, 185, 11, 0.5)',
        'glow-lg': '0 0 30px rgba(240, 185, 11, 0.7)',
        'neon': '0 0 5px theme(colors.accent.500), 0 0 20px theme(colors.accent.500)',
      },
    },
  },
  plugins: [],
}
