const defaultTheme = require('tailwindcss/defaultTheme');

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        accent: token('accent'),
        warn: token('warn'),
        danger: token('danger'),
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
