/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/*.{js,jsx,ts,tsx}",
    "./src/**/*.{jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      xs: '300px',
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'primary': '#12878D',
      'secondary': '#275E61',
      'accent': '#1BD0DA',
      'neutral': '#EBEBEB',
      'success': '#8CDB9E',
      'warning': '#ECEE82',
      'error': '#DA1B1B',
      'black': '#000000'
    },
    extend: {
    }
  },
  plugins: [],
}