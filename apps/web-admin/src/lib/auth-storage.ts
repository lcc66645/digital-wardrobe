import type { User } from '@dw/shared';

/** 登录态在 localStorage 中的键名 */
const TOKEN_KEY = 'dw_admin_token';
const USER_KEY = 'dw_admin_user';

/** 登录接口返回的用户视图（后端 SafeUser，已剥离 passwordHash） */
export type LoginUser = Omit<User, 'passwordHash'>;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): LoginUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: LoginUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
