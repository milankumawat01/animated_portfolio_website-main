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
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        blue: {
          DEFAULT: 'var(--blue)',
          dark: 'var(--blue-dark)',
          light: 'var(--blue-light)',
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
          primary: 'var(--bg-primary)',
          soft: 'var(--bg-soft)',
          'blue-soft': 'var(--bg-blue-soft)',
          dark: 'var(--bg-dark)',
          'dark-soft': 'var(--bg-dark-soft)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-dark': 'var(--text-on-dark)',
        },
        border: {
          DEFAULT: 'var(--border)',
          dark: 'var(--border-dark)',
        },
        surface: {
          feature: 'var(--surface-feature)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
          well: 'var(--surface-well)',
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
