import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: '/pg-poultry/',
  plugins: [checker({ typescript: true })],
  assetsInclude: ['**/*.gltf']
});
