import { defineConfig } from 'wxt';
import { fileURLToPath } from 'url';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [
      cssInjectedByJsPlugin({
        relativeCSSInjection: true,
      }),
    ],
    build: {
      cssCodeSplit: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      postcss: {
        plugins: [
          require('@tailwindcss/postcss'),
          require('autoprefixer'),
        ],
      },
    },
  }),
  manifest: {
    name: 'LucidMark - 光影档案',
    description: '划选即绘图，为创作者打造的本地视觉助手',
    version: '1.0.0',
    permissions: [
      'sidePanel',
      'storage',
      'activeTab',
      'contextMenus',
    ],
    host_permissions: [
      'https://generativelanguage.googleapis.com/*',
    ],
    commands: {
      'generate-image': {
        suggested_key: {
          default: 'Ctrl+Shift+L',
          mac: 'Command+Shift+L',
        },
        description: '生成配图',
      },
    },
    web_accessible_resources: [
      {
        resources: ['assets/*', 'chunks/*'],
        matches: ['<all_urls>'],
      },
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline';",
    },
  },
});
