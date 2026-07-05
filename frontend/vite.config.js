import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Khi dev (npm run dev), moi request /api duoc chuyen tiep sang backend Spring Boot
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    // Build xong, file tinh duoc dat vao thu muc static cua Spring Boot
    // => backend phuc vu luon giao dien, chi can chay 1 server
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
  },
})
