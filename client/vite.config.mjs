import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This file is .mjs because package.json must not set "type": "module": with it, Vite resolves
// CommonJS default exports Node-style and `import ContentEditable from 'react-contenteditable'` breaks.
export default defineConfig({
  plugins: [react()],
  // Keep the Create React App prefix so existing REACT_APP_BACKEND_URL settings keep working
  envPrefix: 'REACT_APP_',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
