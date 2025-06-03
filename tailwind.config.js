import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  // darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Your custom color palette
        primary: {
          DEFAULT: '#ED8213',
          foreground: '#FFFFFF',
        },
        black: '#010100',
        error: '#ED1313',
        success: '#66CA10',
        white: '#FFFFFF',
        background: '#F2F8F8',
        
        // Keep essential UI colors
        border: '#E5E7EB',
        input: '#F3F4F6',
        ring: '#ED8213',
        foreground: '#010100',
        
        secondary: {
          DEFAULT: '#F3F4F6',
          foreground: '#010100',
        },
        muted: {
          DEFAULT: '#F9FAFB',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F2F8F8',
          foreground: '#010100',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['Public Sans', ...fontFamily.sans],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
};