import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TenantUpdate/',  // Updated to match exact repository name
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
