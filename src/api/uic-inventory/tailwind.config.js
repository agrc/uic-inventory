import forms from '@tailwindcss/forms';
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/@agrc/dart-board/**/*.js'],
  theme: {
    minHeight: {
      profile: '36em',
    },
    extend: {
      blur: {
        xs: '1px',
      },
      animation: {
        text: 'text 3s ease infinite',
      },
      keyframes: {
        text: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [forms],
};
