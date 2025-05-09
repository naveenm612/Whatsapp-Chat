import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional, specify the local dev server port
  },
  build: {
    outDir: 'dist', // Default output directory
  },
});
