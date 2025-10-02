// This file is preserved for reference but not used in production
// Tailwind v4 configuration is handled via CSS variables in globals.css
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CPN Brand Colors with opacity support
        'cpn-yellow': 'rgb(242 246 97 / <alpha-value>)',
        'cpn-dark': 'rgb(31 31 31 / <alpha-value>)',
        'cpn-dark2': 'rgb(42 42 42 / <alpha-value>)',
        'cpn-white': 'rgb(255 255 255 / <alpha-value>)',
        'cpn-gray': 'rgb(171 171 171 / <alpha-value>)',
        
        // Semantic colors using CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        // Custom brand fonts
        'heading': ['National2Condensed', 'Arial Black', 'sans-serif'],
        'body': ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // CPN brand button radius
        'cpn-button': '100px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

export default config