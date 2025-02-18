import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0", // Allows external access
    strictPort: true,
    port: 3000,
    allowedHosts: [
      "4aa9-2409-40c2-105a-6309-cd79-ab80-1f3f-2258.ngrok-free.app" // Add your ngrok domain here
    ]
  }

});
