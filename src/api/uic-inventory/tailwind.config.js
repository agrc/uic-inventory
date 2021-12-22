module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/@agrc/dart-board/**/*.js'],
  theme: {
    minHeight: {
      profile: '36em',
    },
    extend: {
      blur: {
        xs: '1px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
