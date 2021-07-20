import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactJsx from 'vite-react-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), reactJsx()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:5001/',
        changeOrigin: true,
        secure: false,
        protocolRewrite: 'https',
      },
    },
  },
});
