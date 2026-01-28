import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA temporalmente deshabilitado para debugging
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'CRM Miguel',
    //     short_name: 'CRM',
    //     description: 'Gestión de clientes y operaciones para Miguel.',
    //     start_url: '.',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#4f46e5',
    //     icons: [
    //       {
    //         src: 'icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
    //   },
    // }),
  ],
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react/jsx-runtime',
      'use-sidecar',
      'react-remove-scroll',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
    esbuildOptions: {
      mainFields: ['module', 'main'],
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Deshabilitar chunking manual, dejar que Vite optimice
      },
    },
  },
});
