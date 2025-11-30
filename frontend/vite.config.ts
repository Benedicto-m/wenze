import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  esbuild: {
    target: "es2022",
  },
  build: {
    target: "es2022",
    outDir: "dist",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
      supported: { 
        bigint: true 
      },
    }
  }
})
