import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const mobileRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(mobileRoot, '../..');

/**
 * App 的 Web 渲染目标：同一套 React Native 源码经 react-native-web 在浏览器运行。
 * 不修改任何 RN 源码，仅在打包解析层把 'react-native' 别名到 react-native-web。
 */
export default defineConfig({
  // 显式锁定预览目录为 root，避免不同调用方式下入口 index.html 解析漂移
  root: __dirname,
  // 独立端口，避免与管理后台 5173 冲突
  server: { port: 5180, host: '127.0.0.1', strictPort: true },
  // GitHub Pages 子路径部署（CI 环境自动生效）；本地 dev 保持根路径
  base: process.env.CI ? '/digital-wardrobe/app/' : '/',
  plugins: [react()],
  define: {
    // 对齐 RN 全局，让 config 走开发分支（web 下 Platform.OS !== 'android'，host 解析为 localhost）
    __DEV__: JSON.stringify(true),
    // react-native-web 的 Animated 内部引用 Node 的 global，浏览器映射到 globalThis
    global: 'globalThis',
  },
  resolve: {
    alias: [
      // 只做精确别名：深路径 react-native/Libraries 不能被替换，否则 codegen 等模块会解析失败
      { find: /^react-native$/, replacement: 'react-native-web' },
      // react-native-screens 在 web 上用透传 shim 替代
      {
        find: /^react-native-screens$/,
        replacement: path.resolve(__dirname, 'shims/react-native-screens.tsx'),
      },
      // safe-area-context 的 ESM 含原生 codegen spec，web 上用 Context shim 替代
      {
        find: /^react-native-safe-area-context$/,
        replacement: path.resolve(__dirname, 'shims/react-native-safe-area-context.tsx'),
      },
    ],
  },
  optimizeDeps: {
    // @dw/shared 是 symlink 的 CJS 包，强制 esbuild 预构建为 ESM，避免源码态 require 报错
    include: ['@dw/shared'],
  },
  build: {
    outDir: 'dist',
    // shared 是 symlink 的 CJS 包，构建期交给 commonjs 插件转换，保证命名导出（枚举）可识别
    commonjsOptions: {
      include: [/packages[\\/]shared/, /node_modules/],
    },
  },
});
