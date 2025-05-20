/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        'qrbox-dark': '#111827',
        'qrbox-light': '#f9fafb'
      }
    }
  },
  plugins: []
}
