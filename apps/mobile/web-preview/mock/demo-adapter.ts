/**
 * 离线演示 Axios Adapter：拦截请求并返回本地模拟数据，
 * 响应仍使用后端统一信封结构，client 拦截器可正常解包。
 * 仅在 web-preview 演示模式通过 http.defaults.adapter 安装。
 */
import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { demoClothing, demoUser } from './demo-data';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function envelope<T>(data: T) {
  return { code: 0, message: 'success', data };
}

function handleClothing(config: InternalAxiosRequestConfig) {
  const params = (config.params ?? {}) as {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
    keyword?: string;
  };

  let list = demoClothing.slice();
  if (params.category) {
    list = list.filter((item) => item.category === params.category);
  }
  if (params.status) {
    list = list.filter((item) => item.status === params.status);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(kw) ||
        (item.color ?? '').toLowerCase().includes(kw) ||
        item.tags.some((tag) => tag.toLowerCase().includes(kw)),
    );
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageList = list.slice(start, start + pageSize);

  return envelope({
    list: pageList,
    total,
    page,
    pageSize,
    totalPages,
  });
}

export async function demoAdapter(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  await sleep(280); // 模拟网络往返，让加载态可被观察

  const url = config.url ?? '';
  let payload;
  if (url.includes('/auth/login')) {
    payload = envelope({
      accessToken: 'demo-access-token',
      user: demoUser,
    });
  } else if (url.includes('/clothing')) {
    payload = handleClothing(config);
  } else {
    // 未模拟的接口统一返回空数据，保证页面不崩溃
    payload = envelope(null);
  }

  return {
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}
