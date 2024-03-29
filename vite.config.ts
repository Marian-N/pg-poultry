import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: '/pg-poultry/',
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '~bootstrap-icons': path.resolve(
        __dirname,
        'node_modules/bootstrap-icons'
      ),
      fonts: path.resolve(__dirname, 'resources/fonts')
    }
  },
  plugins: [
    checker({ typescript: true }),
    viteStaticCopy({
      targets: [
        {
          src: 'resources/models/poultry/textures/*.png',
          dest: 'assets/textures'
        },
        {
          src: 'resources/models/farm/textures/*.png',
          dest: 'assets/textures'
        },
        {
          src: '**/*.bin',
          dest: 'assets'
        },
        {
          src: 'resources/images/help/*.png',
          dest: 'assets/images/help'
        },
        {
          src: 'resources/models/poultry/*.png',
          dest: 'assets'
        }
      ]
    })
  ],
  assetsInclude: ['**/*.gltf', '**/*.png', '**/*.jpg', '**/*.fbx']
});
