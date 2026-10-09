/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        rosa: '#ee95be',
        rosaClaro: '#f8d0e4',
        marron: '#6d544f',
        marronClaro: '#8a6f68',
        verde: '#065a2a',
        lima: '#d0d721',
        oscuro: '#211f20',
        crema: '#faf6f2',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
