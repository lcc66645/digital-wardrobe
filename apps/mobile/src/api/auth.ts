import type { User } from '@dw/shared';
import { post } from './client';

/**
 * 登录用户对外结构：后端 SafeUser 已剥离 passwordHash；
 * JSON 传输后时间字段为 ISO 字符串（shared User 中为 Date 实例形态，端侧按字符串接收）。
 */
export type LoginUser = Omit<
  User,
  'passwordHash' | 'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

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
