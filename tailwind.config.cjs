/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ritual: {
          50: '#fbf8ff',
          100: '#f3ecff',
          200: '#e4d9ff',
          300: '#d2bdff',
          400: '#b889ff',
          500: '#8f4bff',
          600: '#7a3de6',
          700: '#652fbb',
          800: '#4e258f',
          900: '#391a66'
        }
      }
    }
  },
  plugins: []
}
