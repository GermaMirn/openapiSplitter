import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  cacheDir: '/tmp/.vite',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    strictPort: false,
    watch: {
      usePolling: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
