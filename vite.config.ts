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
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'AWS SA Prep',
        short_name: 'SA Prep',
        description: 'Study AWS services and practice Solutions Architect interviews on the go',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          { urlPattern: /\/api\/whats-new/, handler: 'NetworkFirst', options: { cacheName: 'whats-new' } },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1200 },
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
