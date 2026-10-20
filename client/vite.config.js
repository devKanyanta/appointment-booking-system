import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiOrigin = 'http://64.227.39.246:3339';

export default defineConfig(({ command }) => ({
  define: command === 'build'
    ? { 'import.meta.env.VITE_API_URL': JSON.stringify(`${apiOrigin}/api`) }
    : {},
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3338,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiOrigin,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3338,
    strictPort: true,
  },
}));
