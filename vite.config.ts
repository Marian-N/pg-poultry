import checker from 'vite-plugin-checker';

/** @type {import('vite').UserConfig} */
export default {
  base: '/pg-poultry/',
  plugins: [checker({ typescript: true })]
};
