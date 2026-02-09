/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dogh: {
          primary: '#0e7490',
          secondary: '#155e75',
          accent: '#06b6d4',
          light: '#ecfeff',
          dark: '#083344',
        }
      }
    },
  },
  plugins: [],
}
