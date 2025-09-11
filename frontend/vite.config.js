/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@css': path.resolve(__dirname, './src/asstes/css'),
      '@fonts': path.resolve(__dirname, './src/asstes/fonts'),
      '@images': path.resolve(__dirname, './src/asstes/images'),
      '@dashboard': path.resolve(__dirname, './src/pages/dashboard'),
      '@router': path.resolve(__dirname, './src/router'),



    },
  },
})
