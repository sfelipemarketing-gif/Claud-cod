import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite publicar em qualquer subpasta (GitHub Pages, Netlify, servidor interno)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
});
