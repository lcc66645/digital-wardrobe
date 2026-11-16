import { post } from './client';

/**
 * 登录用户在移动端只承载当前界面需要的字段；
 * 与后端 User 实体 / @dw/shared UserVo 结构兼容，多余字段不影响读取。
 */
export interface LoginUser {
  id: string;
  nickname: string;
  phone: string;
  avatar?: string | null;
  gender?: string | null;
  city?: string | null;
  height?: number | null;
  stylePreference?: string | null;
  status: 'ACTIVE' | 'BANNED';
  createdAt?: string;
}

export interface LoginResult {
  accessToken: string;
  user: LoginUser;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

/** 手机号 + 密码登录，对应后端 POST /api/auth/login */
export function loginApi(payload: LoginPayload): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', payload);
}
