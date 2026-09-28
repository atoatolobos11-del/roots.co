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
        // Entrance for the account form fields, staggered by an inline delay.
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Confirmation tick on the signed-in panel.
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Slow drifting light behind the account dialog header.
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(14px, 10px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'drift-slow': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-16px, 14px, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
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
        rise: 'rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        pop: 'pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        drift: 'drift 7s ease-in-out infinite',
        'drift-slow': 'drift-slow 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
