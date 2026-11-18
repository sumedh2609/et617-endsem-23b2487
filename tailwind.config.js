/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mukta', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: '#1e2b3a',
        paper: '#f7f5ef',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,43,58,0.06), 0 4px 16px rgba(30,43,58,0.06)',
      },
    },
  },
  plugins: [],
};
