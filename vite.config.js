import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Exposes the dev server on the LAN so you can test on a real handset.
    host: true,
  },
})
