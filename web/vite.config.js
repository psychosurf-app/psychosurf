import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the app at https://psychosurf-app.github.io/psychosurf/,
  // so the built files must point to /psychosurf/. Local dev stays at /.
  base: command === 'build' ? '/psychosurf/' : '/',
}))
