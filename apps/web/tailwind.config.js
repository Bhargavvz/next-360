/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem', lg: '2.5rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          sunken: 'hsl(var(--surface-sunken))',
          hover: 'hsl(var(--surface-hover))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          hover: 'hsl(var(--primary-hover))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary-muted))',
          border: 'hsl(var(--primary-border))',
        },
        seal: {
          DEFAULT: 'hsl(var(--seal))',
          foreground: 'hsl(var(--seal-foreground))',
          muted: 'hsl(var(--seal-muted))',
          border: 'hsl(var(--seal-border))',
        },
        organic: {
          DEFAULT: 'hsl(var(--organic))',
          muted: 'hsl(var(--organic-muted))',
        },
        natural: {
          DEFAULT: 'hsl(var(--natural))',
          muted: 'hsl(var(--natural-muted))',
        },
        eco: {
          DEFAULT: 'hsl(var(--eco))',
          muted: 'hsl(var(--eco-muted))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          muted: 'hsl(var(--success-muted))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          muted: 'hsl(var(--warning-muted))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          muted: 'hsl(var(--destructive-muted))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          muted: 'hsl(var(--info-muted))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        subtle: { foreground: 'hsl(var(--subtle-foreground))' },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      borderRadius: {
        xs: 'calc(var(--radius) - 8px)',
        sm: 'calc(var(--radius) - 6px)',
        md: 'calc(var(--radius) - 4px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 18px)',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      /* A deliberate scale — each step earns its place, with line-height and
         tracking baked in so headings never need manual tuning. */
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.01em' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.0625rem', { lineHeight: '1.625rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.95rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.375rem', { lineHeight: '2.65rem', letterSpacing: '-0.025em' }],
        '5xl': ['3.125rem', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        '6xl': ['3.875rem', { lineHeight: '1.04', letterSpacing: '-0.032em' }],
        '7xl': ['4.75rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },

      spacing: { 4.5: '1.125rem', 13: '3.25rem', 15: '3.75rem', 18: '4.5rem', 22: '5.5rem' },

      /* Editorial measure — body copy should never exceed ~72 characters. */
      maxWidth: { measure: '68ch', 'measure-tight': '52ch' },

      /* One easing for everything. `natural` is a gentle overshoot-free
         curve; `spring` is used only for things that appear. */
      transitionTimingFunction: {
        natural: 'cubic-bezier(0.32, 0.72, 0, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: { 250: '250ms', 400: '400ms' },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'none' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.22s cubic-bezier(0.32,0.72,0,1)',
        'accordion-up': 'accordion-up 0.22s cubic-bezier(0.32,0.72,0,1)',
        'fade-up': 'fade-up 0.4s cubic-bezier(0.32,0.72,0,1) both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32,0.72,0,1)',
      },

      backgroundImage: {
        /* Used behind the hero — a soft directional light rather than a
           two-stop gradient bar. */
        'moss-wash':
          'radial-gradient(ellipse 80% 60% at 20% 0%, hsl(var(--primary) / 0.10), transparent 70%), radial-gradient(ellipse 60% 50% at 90% 10%, hsl(var(--seal) / 0.07), transparent 65%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
