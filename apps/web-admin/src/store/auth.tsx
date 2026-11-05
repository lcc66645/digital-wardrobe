import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as loginApi, type LoginPayload } from '@/api/auth';
import {
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type LoginUser,
} from '@/lib/auth-storage';

interface AuthContextValue {
  token: string | null;
  user: LoginUser | null;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<LoginUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 初始化时从 localStorage 恢复登录态，刷新页面不丢失
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<LoginUser | null>(() => getStoredUser());

  const signIn = useCallback(async (payload: LoginPayload) => {
    const result = await loginApi(payload);
    setToken(result.accessToken);
    setStoredUser(result.user);
    setTokenState(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [token, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  }
  return ctx;
}
