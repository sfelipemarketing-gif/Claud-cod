/** Cores centralizadas em src/index.css (variáveis CSS) — substitua lá pelos códigos oficiais. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: v('navy'), 950: v('navy-950'), 900: v('navy-900'), 700: v('navy-700'), 600: v('navy-600'), 100: v('navy-100'), 50: v('navy-50') },
        bred: { DEFAULT: v('bred'), 700: v('bred-700'), 50: v('bred-50') },
        ink: { DEFAULT: v('ink'), soft: v('ink-soft'), mute: v('ink-mute') },
        line: v('line'),
        surface: v('surface'),
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', '"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7,40,81,.04), 0 4px 16px -4px rgba(7,40,81,.08)',
        lift: '0 2px 4px rgba(7,40,81,.05), 0 16px 40px -12px rgba(7,40,81,.22)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(.97)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-up': 'fade-up .35s ease both', 'scale-in': 'scale-in .2s ease both' },
    },
  },
  plugins: [],
};
