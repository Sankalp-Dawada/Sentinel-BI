import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative paths so it works on any subpath (GH Pages)
  server: {
    proxy: {
      '/api': {
        target: 'https://sentinel-bi.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
