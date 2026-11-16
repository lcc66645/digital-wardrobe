import { create } from 'zustand';
import { loginApi, LoginUser } from '../api/auth';
import { onUnauthorized, tokenBridge } from '../api/client';

interface AuthState {
  token: string;
  user: LoginUser | null;
  loading: boolean;
  error: string | null;
  /** 登录成功返回 true，失败时 error 已写入状态 */
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  user: null,
  loading: false,
  error: null,

  login: async (phone, password) => {
    set({ loading: true, error: null });
    try {
      const result = await loginApi({ phone: phone.trim(), password });
      tokenBridge.set(result.accessToken);
      set({
        token: result.accessToken,
        user: result.user,
        loading: false,
        error: null,
      });
      return true;
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : '登录失败，请稍后重试',
      });
      return false;
    }
  },

  logout: () => {
    tokenBridge.clear();
    set({ token: '', user: null, error: null, loading: false });
  },

  clearError: () => set({ error: null }),
}));

// 任意请求遇到 401 时统一清空登录态，导航层据此回到登录页
onUnauthorized(() => {
  useAuthStore.getState().logout();
});
