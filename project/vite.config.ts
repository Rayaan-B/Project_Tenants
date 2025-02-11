import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Project_Tenants/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    fs: {
      strict: false
    },
    host: true
  },
  preview: {
    host: true,
    port: 4173
  }
});
