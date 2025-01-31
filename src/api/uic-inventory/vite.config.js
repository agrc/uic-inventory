import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
  test: {
    env: 'node',
    provider: 'v8',
    environment: 'happy-dom',
  },
  resolve: {
    // this is only applicable when pnpm-linking the utah-design-package
    dedupe: ['firebase', 'react'],
  },
});
