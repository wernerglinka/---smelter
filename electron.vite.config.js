import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.js'),
          customDialog: resolve(__dirname, 'src/main/custom-dialog/preload.cjs')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@components': resolve(__dirname, 'src/renderer/src/components'),
        '@hooks': resolve(__dirname, 'src/renderer/src/hooks'),
        '@services': resolve(__dirname, 'src/renderer/src/lib/utilities/services'),
        '@lib': resolve(__dirname, 'src/renderer/src/lib'),
        '@screens': resolve(__dirname, 'src/renderer/src/screens'),
        '@formsContext': resolve(__dirname, 'src/renderer/src/lib/form-generation/context')
      }
    },
    plugins: [react()]
  }
});
