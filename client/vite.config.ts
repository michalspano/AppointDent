import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [eslint(),solid()],
  
})
