import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslintPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7004/',
        changeOrigin: true,
        secure: false,
        protocolRewrite: 'https',
        cookieDomainRewrite: 'localhost:5173',
      },
    },
  },
});
