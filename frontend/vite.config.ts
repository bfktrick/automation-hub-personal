import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 4444,
      protocol: 'http',
    },
    proxy: {
      '/api': {
        target: 'http://api:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  esbuild: {
    drop: [],
    minify: false,
  },
  build: {
    minify: false,
  },
})
