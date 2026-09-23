// Theme colors are hex CSS variables, which Tailwind can't apply an opacity
// modifier to (`text-text-on-dark/60` rendered fully opaque). color-mix lets
// `/NN` work while globals.css keeps plain hex values.
const v = (name) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: v('ink'),
          soft: v('ink-soft'),
        },
        blue: {
          DEFAULT: v('blue'),
          dark: v('blue-dark'),
          light: v('blue-light'),
          50: '#F2F7FF',
          100: '#EAF3FF',
          200: '#BAE0FF',
          300: '#91CAFF',
          400: '#69B1FF',
          500: '#4096FF',
          600: '#1677FF',
          700: '#0958D9',
          800: '#003EB3',
          900: '#002C8C',
        },
        bg: {
          primary: v('bg-primary'),
          soft: v('bg-soft'),
          'blue-soft': v('bg-blue-soft'),
          dark: v('bg-dark'),
          'dark-soft': v('bg-dark-soft'),
        },
        text: {
          primary: v('text-primary'),
          secondary: v('text-secondary'),
          muted: v('text-muted'),
          'on-dark': v('text-on-dark'),
        },
        border: {
          DEFAULT: v('border'),
          dark: v('border-dark'),
        },
        surface: {
          feature: v('surface-feature'),
          elevated: v('surface-elevated'),
          overlay: v('surface-overlay'),
          well: v('surface-well'),
        },
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'serif'],
        handwriting: ['var(--font-caveat)', 'cursive'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(11, 18, 32, 0.06)',
        'card': '0 16px 45px rgba(11, 18, 32, 0.08)',
        'blue-glow': '0 0 35px -5px rgba(22, 119, 255, 0.35)',
      },
      letterSpacing: {
        'hero': '-0.055em',
        'heading': '-0.045em',
        'label': '0.16em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
