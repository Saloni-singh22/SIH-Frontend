import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Redirect dashboard requests to the correct backend API
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashboard/, '/dashboard')
      },
      // Redirect FHIR resource requests to the correct backend API
      '/CodeSystem': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/CodeSystem/, '/CodeSystem')
      },
      '/ConceptMap': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ConceptMap/, '/ConceptMap')
      },
      '/ValueSet': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ValueSet/, '/ValueSet')
      }
    }
  }
})
