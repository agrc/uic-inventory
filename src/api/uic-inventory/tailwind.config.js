import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/@ugrc/utah-design-system/**/*'],
  theme: {
    minHeight: {
      profile: '36em',
    },
    extend: {
      colors: {
        primary: colors.gray,
        secondary: colors.indigo,
        accent: colors.teal,
        warning: colors.rose,
      },
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
