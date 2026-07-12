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
      includeAssets: ['icon-32.png', 'icon-64.png', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'assets/**/*'], 
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,gif,json,wav,mp3}']
      },
      manifest: {
        name: 'MOMENTUM',
        short_name: 'Momentum',
        description: 'A fast-paced pixel art endless runner. Survive, jump, slide, and trigger Fever mode!',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'fullscreen',
        orientation: 'portrait',
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