import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    proxy: {
      '/api': {
        // point at your functions emulator host/port and rewrite to the exported function name
        target: 'http://localhost:8121', // change if emulator runs on a different port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/paypalApi')
      }
    }
  }
})