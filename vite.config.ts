import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths — the webOS app host serves index.html from its
  // own app-local root, not a domain root, so absolute "/assets/..." URLs
  // would 404 on-device even though they work fine from the Vite dev server.
  base: './',
  plugins: [react(), tailwindcss()],
})
