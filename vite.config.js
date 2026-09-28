import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The catalogue is static, so assets can safely be inlined when small.
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Split the framework out of the app chunk so a copy change does not
        // invalidate the React vendor bundle in the browser cache.
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
