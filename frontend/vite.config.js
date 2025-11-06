import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  server: {
    // This is needed for Docker container port mapping
    host: '0.0.0.0',
    port: 3000,
  }
})

