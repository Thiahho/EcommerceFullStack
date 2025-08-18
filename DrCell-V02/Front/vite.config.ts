import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // permite acceso desde otros dispositivos
    port: 3000,
    https: false, // 🔧 Forzar HTTP para desarrollo local
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
