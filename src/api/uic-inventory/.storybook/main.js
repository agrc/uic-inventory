module.exports = {
  viteFinal(config) {
    config.plugins = [...config.plugins, require('vite-react-jsx').default()];

    return config;
  },
  stories: ['../src/**/**/*.stories.jsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    builder: 'storybook-builder-vite',
  },
};
