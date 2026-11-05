import type { User } from '@dw/shared';
import { http } from '@/lib/http';

/** 登录请求体（字段对齐后端 LoginDto） */
export interface LoginPayload {
  phone: string;
  password: string;
}

/** 登录返回：访问令牌 + 已脱敏用户（与后端 AuthResult 一致） */
export interface LoginResult {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

/** 当前登录用户资料（后端 SafeUser） */
export type ProfileResult = Omit<User, 'passwordHash'>;

export function login(payload: LoginPayload) {
  return http.post<LoginResult>('/auth/login', payload);
}

export function fetchProfile() {
  return http.get<ProfileResult>('/auth/profile');
}
