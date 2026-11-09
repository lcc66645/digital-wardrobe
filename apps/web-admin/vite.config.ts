import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      // 开发期把 /api 代理到后端，避免跨域并与生产同源口径一致
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  // workspace 共享包经 junction 链接、真实路径在 node_modules 外，
  // 显式纳入 CJS 转换，保证其 CommonJS 命名导出（枚举）可被 Rollup 识别
  optimizeDeps: {
    include: ['@dw/shared'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    commonjsOptions: {
      include: [/packages[\\/]shared/, /node_modules/],
    },
  },
});
