import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Keep the same port as CRA
    open: true, // Automatically open browser
    // Proxy API requests to the backend to avoid CORS issues during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your backend API URL
        changeOrigin: true,
        // secure: false, // Uncomment if backend is not HTTPS
        // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if backend doesn't expect /api prefix
      }
    }
  },
  build: {
    outDir: 'build' // Match the CRA output directory
  }
});
