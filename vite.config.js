import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from "vite-plugin-remove-console";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole()
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('lodash')) return 'lodash';
            return 'vendor';
          }
        },
      },
    },
  },
});
