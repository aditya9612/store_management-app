/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Core directories
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@router': path.resolve(__dirname, './src/router'),

      // Feature-specific aliases
      '@customer': path.resolve(__dirname, './src/features/customer'),
      '@shop-owner': path.resolve(__dirname, './src/features/shop-owner'),
      '@company-admin': path.resolve(__dirname, './src/features/company-admin'),

      // Shared resources
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@styles': path.resolve(__dirname, './src/shared/styles'),
      '@assets': path.resolve(__dirname, './src/shared/assets'),
    },
  },
})
