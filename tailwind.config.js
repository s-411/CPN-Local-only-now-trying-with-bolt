/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        'cpn-yellow': '#f2f661',
        'cpn-dark': '#1f1f1f',
        'cpn-dark2': '#2a2a2a',
        'cpn-white': '#ffffff',
        'cpn-gray': '#ababab',
      },
    },
  },
  plugins: [],
}
