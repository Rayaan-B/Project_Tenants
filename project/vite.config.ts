import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Project_Tenants/',  // Updated to match exact repository name
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
