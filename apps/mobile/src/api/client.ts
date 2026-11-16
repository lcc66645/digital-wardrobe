import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../config';

/** 统一响应信封，与后端 TransformInterceptor 对齐 */
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

/** 业务异常：code 非 0 时抛出，message 可直接展示给用户 */
export class BizError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = 'BizError';
    this.code = code;
  }
}

/**
 * 内存 token 桥：请求拦截器从此处取 Authorization，
 * 鉴权 store 登录/登出时写入，避免 client 与 store 循环依赖。
 * 后续替换为 AsyncStorage 持久化时仅需改造本对象的读写。
 */
let memoryToken = '';
export const tokenBridge = {
  get(): string {
    return memoryToken;
  },
  set(token: string): void {
    memoryToken = token;
  },
  clear(): void {
    memoryToken = '';
  },
};

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;
/** 401 时由鉴权 store 注册登出回调 */
export function onUnauthorized(listener: UnauthorizedListener): void {
  unauthorizedListener = listener;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) {
        // 解包：调用方拿到的 response.data 即业务 data
        response.data = body.data as never;
        return response;
      }
      return Promise.reject(new BizError(body.message || '请求失败', body.code));
    }
    return response;
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status;
    if (status === 401) {
      memoryToken = '';
      unauthorizedListener?.();
    }
    const message =
      error.response?.data?.message || error.message || '网络异常，请稍后重试';
    return Promise.reject(new Error(message));
  },
);

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await http.get<T>(url, { params });
  return response.data as T;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.post<T>(url, data);
  return response.data as T;
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await http.patch<T>(url, data);
  return response.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const response = await http.delete<T>(url);
  return response.data as T;
}
