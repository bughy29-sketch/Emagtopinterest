/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pinterest: {
          red: '#E60023',
          darkRed: '#ad081b',
          gray: '#efefef',
          darkGray: '#333333',
        },
        emag: {
          blue: '#005eb8',
          red: '#e10e17',
          dark: '#1e2832',
        }
      }
    },
  },
  plugins: [],
}
