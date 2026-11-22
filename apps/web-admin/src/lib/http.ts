import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@dw/shared';
import { clearAuth, getToken } from './auth-storage';

/** 业务错误：携带后端 code 与可展示信息 */
export class BizError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'BizError';
    this.code = code;
  }
}

// 公网部署时可用 VITE_API_BASE_URL 覆盖；默认 /api 走本地 dev 代理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export { instance as axiosInstance };

// 请求拦截：自动注入 Bearer Token
instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：统一处理 401 与网络/HTTP 错误
instance.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.message;

    if (status === 401) {
      // 登录态失效：清理并回到登录页（HashRouter 下路由位于 hash）
      clearAuth();
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
      return Promise.reject(new BizError(401, serverMsg ?? '登录已失效，请重新登录'));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new BizError(408, '请求超时，请稍后重试'));
    }
    if (!error.response) {
      return Promise.reject(new BizError(0, '网络异常，请检查网络连接'));
    }

    return Promise.reject(new BizError(status ?? 500, serverMsg ?? error.message ?? '请求失败'));
  },
);

/** 解包统一响应，直接返回 data 部分；业务 code 非 0 时抛错 */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const resp = await instance.request<ApiResponse<T>>(config);
  const body = resp.data;
  if (body.code !== 0) {
    throw new BizError(body.code, body.message);
  }
  return body.data;
}

export const http = {
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) {
    return request<T>({ method: 'GET', url, params, ...config });
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ method: 'POST', url, data, ...config });
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ method: 'PATCH', url, data, ...config });
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ method: 'PUT', url, data, ...config });
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ method: 'DELETE', url, ...config });
  },
};
