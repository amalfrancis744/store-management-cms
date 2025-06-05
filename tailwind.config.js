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
     
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        black: "var(--black)",
        error: "var(--error)",
        success: "var(--success)",
        white: "var(--white)",
        background: "var(--background)",
        
       
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        foreground: "var(--foreground)",
        
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",

        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground:"var(--accent-foreground)",
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
   fontFamily: {
        sans: ['Figtree', 'Heebo', 'Public Sans', ...fontFamily.sans], // Figtree as default, followed by Heebo, Public Sans, and fallbacks
        figtree: ['Figtree', ...fontFamily.sans], // Custom utility for Figtree
        heebo: ['Heebo', ...fontFamily.sans],
        manrope:['Manrope',...fontFamily.sans] // Custom utility for Heebo
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
};