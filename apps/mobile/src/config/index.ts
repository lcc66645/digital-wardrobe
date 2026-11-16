import { Platform } from 'react-native';

/**
 * 后端 API 地址配置。
 * - Android 模拟器访问宿主机回环地址使用 10.0.2.2；
 * - iOS 模拟器可直接使用 localhost；
 * - 真机（开发期）需改成开发机的局域网 IP，例如 http://192.168.1.10:3000/api。
 * 后端全局前缀为 /api，统一响应体 { code, message, data }，成功 code=0。
 */

const SERVER_PORT = 3000;
/** 真机调试时替换为开发机局域网 IP */
const LAN_HOST = '192.168.1.10';

function resolveDevHost(): string {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

export const API_BASE_URL = __DEV__
  ? `http://${resolveDevHost()}:${SERVER_PORT}/api`
  : `http://${LAN_HOST}:${SERVER_PORT}/api`;

/** 登录态本地存储键（下一轮接入 AsyncStorage 后启用持久化，当前仅内存态） */
export const TOKEN_STORAGE_KEY = 'dw_mobile_token';
