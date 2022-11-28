import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: '/pg-poultry/',
  plugins: [
    checker({ typescript: true }),
    viteStaticCopy({
      targets: [
        {
          src: 'resources/models/poultry/textures/*.png',
          dest: 'assets/textures'
        },
        {
          src: '**/*.bin',
          dest: 'assets'
        }
      ]
    })
  ],
  assetsInclude: ['**/*.gltf', '**/*.png', '**/*.jpg']
});
