/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'albert': ['var(--font-albert)', 'sans-serif'],
        'nova': ['var(--font-nova)', 'sans-serif'],
      },
      colors: {
        'primary': '#2979FF',    // Vibrant Blue
        'secondary': '#333333',  // Charcoal Gray
        'accent1': '#FF6D00',    // Warm Orange
        'accent2': '#D9D9D9',    // Light Gray
        'neutral': '#FFFFFF',    // White
      },
    },
  },
  plugins: [],
}