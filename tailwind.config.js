/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0E0F13',
        surface: '#16181F',
        border: '#252830',
        accent: '#6C7FFF',
        'accent-2': '#3ECFB2',
        'text-1': '#ECEEF4',
        'text-2': '#8B8FA8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}