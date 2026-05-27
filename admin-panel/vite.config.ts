import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { port: 5174 },
  plugins: [react()],
  build: {
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: true,
    sourcemap: false,
    modulePreload: {
      polyfill: false,
    },
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['lucide-react'],
          network: ['axios'],
        },
      },
    },
  },
});



