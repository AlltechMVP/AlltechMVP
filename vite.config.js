
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 443,
      host: `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    }
  }
})
