const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Monorepo（npm workspaces）Metro 配置
 * - watchFolders 把 workspace 根目录纳入监听，使 junction 到 packages/shared 的包可被解析；
 * - nodeModulesPaths 显式指向 mobile 与仓库根两层 node_modules（依赖统一 hoist 到仓库根）；
 * - @dw/shared 当前以编译产物 packages/shared/lib（CommonJS）形式被消费；
 *   修改 shared 源码后需先在 packages/shared 执行 `npm run build` 再启动 Metro。
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
