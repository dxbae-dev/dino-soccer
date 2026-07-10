import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Simplificado para atrapar todos los assets de la carpeta public automáticamente
      includeAssets: ['icon-32.png', 'icon-64.png', 'icon-180.png', 'assets/**/*'], 
      manifest: {
        name: 'MOMENTUM',
        short_name: 'Momentum',
        description: 'A fast-paced pixel art endless runner. Survive, jump, slide, and trigger Fever mode!',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait', // Bloquea la PWA en vertical, ideal para tu UI actual
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})