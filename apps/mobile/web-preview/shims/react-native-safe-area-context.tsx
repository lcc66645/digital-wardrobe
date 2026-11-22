/**
 * react-native-safe-area-context 的 Web shim。
 * 官方包的 ESM 产物含 codegen 原生 spec（依赖 Metro 的 .web 平台扩展解析），
 * Vite 不做该解析，因此在浏览器预览中用零安全区的 Context 实现替代；
 * 仅在 web-preview 构建时生效，不影响原生端。
 */
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export type EdgeInsets = { top: number; left: number; right: number; bottom: number };
export type Rect = { x: number; y: number; width: number; height: number };

const ZERO_INSETS: EdgeInsets = { top: 0, left: 0, right: 0, bottom: 0 };
const DEFAULT_FRAME: Rect = { x: 0, y: 0, width: 390, height: 844 };

export const SafeAreaInsetsContext = createContext<EdgeInsets>(ZERO_INSETS);
export const SafeAreaFrameContext = createContext<Rect>(DEFAULT_FRAME);

export function useSafeAreaInsets(): EdgeInsets {
  return useContext(SafeAreaInsetsContext);
}

export function useSafeAreaFrame(): Rect {
  return useContext(SafeAreaFrameContext);
}

interface ProviderProps {
  children: ReactNode;
  initialMetrics?: unknown;
}

export function SafeAreaProvider({ children }: ProviderProps) {
  const insets = useMemo(() => ZERO_INSETS, []);
  const frame = useMemo(() => DEFAULT_FRAME, []);
  return (
    <SafeAreaFrameContext.Provider value={frame}>
      <SafeAreaInsetsContext.Provider value={insets}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </SafeAreaFrameContext.Provider>
  );
}

type Edge = 'top' | 'bottom' | 'left' | 'right';

interface SafeAreaViewProps {
  children?: ReactNode;
  edges?: Edge[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any;
}

// 预览外壳已模拟机身边框，这里安全区内边距统一为 0，仅透传样式与子节点
export function SafeAreaView({ style, children, ...rest }: SafeAreaViewProps) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

export const initialWindowMetrics = {
  insets: ZERO_INSETS,
  frame: DEFAULT_FRAME,
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
