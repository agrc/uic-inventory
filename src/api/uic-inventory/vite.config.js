import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: `import * as React from 'react';`
  },
  server: {
    proxy: {
      '/graphql': 'http://localhost:5000/graphql'
    }
  }
})
