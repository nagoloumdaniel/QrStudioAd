import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // three.js lives in the lazily loaded 404 chunk only.
  build: { chunkSizeWarningLimit: 600 },
});
