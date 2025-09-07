import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CRM-MIGUEL',
        short_name: 'CRM-MIGUEL',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        description: 'CRM para Miguel, versión web adaptable e instalable.',
        icons: [
          {
            src: '/icon-mr-black.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-mr-black.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('supabase')) return 'vendor-supabase';
            if (id.includes('chart.js')) return 'vendor-chartjs';
            return 'vendor';
          }
        },
      },
    },
  },
});
