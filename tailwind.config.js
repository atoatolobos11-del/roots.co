/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Warm tonal palette, warmed to sit with the catalogue photography:
      // cream, camel, tan leather and denim rather than the previous cool greys.
      colors: {
        ink: '#1C1917', // near-black espresso
        soft: '#332E2A', // deep brown-black
        off: '#F8F5EF', // warm off-white
        mist: '#EDE7DC', // sand
        ash: '#7A7267', // warm grey
        line: '#DDD5C7', // warm border
        accent: '#A98A62', // camel
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.18em',
        wideish: '0.12em',
      },
      maxWidth: {
        shell: '1440px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee-swap': {
          '0%, 100%': { opacity: '1', transform: 'translateY(0)' },
          '50%': { opacity: '0', transform: 'translateY(-6px)' },
        },
        'bar-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'marquee-swap': 'marquee-swap 0.5s ease-out',
        'bar-grow': 'bar-grow 6s linear infinite',
      },
    },
  },
  plugins: [],
}
