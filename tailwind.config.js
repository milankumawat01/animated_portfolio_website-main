/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1a1a1a',
        'dark-deep': '#0d0d0d',
        'accent-orange': '#f97316',
        'accent-pink': '#ec4899',
        'accent-purple': '#a855f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      width: {
        'sidebar': '200px',
      },
      margin: {
        'sidebar': '200px',
      },
    },
  },
  plugins: [],
}
