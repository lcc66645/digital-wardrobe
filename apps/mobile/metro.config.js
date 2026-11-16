const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Monorepo 说明：后续接入 packages/shared 源码时，
// 需在此补充 watchFolders 与 nodeModulesPaths，当前移动端先使用包内类型，暂保持默认配置。
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
