/** @type {import('tailwindcss').Config} */
module.exports = {
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
          DEFAULT: '#0B1220',
          soft: '#172033',
        },
        blue: {
          DEFAULT: '#1677FF',
          dark: '#0D5ED7',
          light: '#EAF3FF',
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
          primary: '#FFFFFF',
          soft: '#F7F9FC',
          'blue-soft': '#F2F7FF',
          dark: '#080B10',
          'dark-soft': '#10151D',
        },
        text: {
          primary: '#0B1220',
          secondary: '#536078',
          muted: '#8993A5',
          'on-dark': '#F7F9FC',
        },
        border: {
          DEFAULT: '#E4E9F1',
          dark: '#27303C',
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
  plugins: [],
};
