export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239'
        }
      },
      boxShadow: {
        soft: '0 16px 45px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
}
