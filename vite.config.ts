import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
  plugins: [ 
      react(), tailwindcss(),
  //     VitePWA({
  //        registerType: 'autoUpdate',
  //        manifest: {
  //          name: 'Spag Chat',
  //          short_name: 'Chat',
  //          start_url: '.',
  //          display: 'standalone',
  //          background_color: '#ffffff',
  //          theme_color: '#3b82f6',
  //          icons: [
  //            {
  //              src: 'icon-192.png',
  //              sizes: '192x192',
  //              type: 'image/png'
  //            },
  //            {
  //              src: 'icon-512.png',
  //              sizes: '512x512',
  //              type: 'image/png'
  //            }
  //          ]
  //        }
  //      })
   ],
})
