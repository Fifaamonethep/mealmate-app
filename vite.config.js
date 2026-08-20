import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-mealmate.png'],
      manifest: {
        name: 'MealMate',
        short_name: 'MealMate',
        description: 'Split bills with friends easily. Track group expenses, settle debts with QR payments.',
        theme_color: '#6ae6a8',
        icons: [
          {
            src: '/logo-mealmate.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-mealmate.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
