/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pw: {
          ivory: 'rgb(var(--pw-ivory) / <alpha-value>)',
          card: 'rgb(var(--pw-card) / <alpha-value>)',
          plum: 'rgb(var(--pw-plum) / <alpha-value>)',
          burgundy: 'rgb(var(--pw-burgundy) / <alpha-value>)',
          rose: 'rgb(var(--pw-rose) / <alpha-value>)',
          blush: 'rgb(var(--pw-blush) / <alpha-value>)',
          text: 'rgb(var(--pw-text) / <alpha-value>)',
          muted: 'rgb(var(--pw-muted) / <alpha-value>)',
          border: 'rgb(var(--pw-border) / <alpha-value>)',
          sand: 'rgb(var(--pw-sand) / <alpha-value>)',
          gold: 'rgb(var(--pw-gold) / <alpha-value>)',
        },
        brand: {
          50: '#FAF6F7',
          100: '#EEE4E6',
          200: '#DCBFC7',
          300: '#CA9BA8',
          400: '#B87988',
          500: '#8E485F',
          600: '#642D43',
          700: '#542639',
          800: '#482638',
          900: '#341B28',
          950: '#221019',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['Caveat', '"Segoe Script"', 'cursive'],
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'ring': { '0%': { transform: 'scale(0.9)', opacity: '0.5' }, '100%': { transform: 'scale(1.5)', opacity: '0' } },
        'dash': { to: { strokeDashoffset: '-24' } },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'float': 'float 6s ease-in-out infinite',
        'ring': 'ring 3.2s ease-out infinite',
        'dash': 'dash 2.4s linear infinite',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(72, 38, 56, 0.04), 0 1px 2px -1px rgba(72, 38, 56, 0.04)',
        'card': '0 4px 20px -2px rgba(72, 38, 56, 0.06)',
        'dropdown': '0 10px 25px -5px rgba(72, 38, 56, 0.1)',
        'glow': '0 0 20px rgba(184, 121, 136, 0.25)',
      },
    },
  },
  plugins: [],
}
