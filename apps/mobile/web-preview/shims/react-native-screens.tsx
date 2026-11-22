/**
 * react-native-screens 的 Web shim。
 * 原生 Screen 容器在浏览器上不存在，这里用普通 View 透传，保证导航栈内容正常渲染；
 * 仅在 web-preview 构建时通过 Vite alias 生效，不影响原生端代码。
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShimProps = { children?: ReactNode } & Record<string, any>;

export function enableScreens(): void {}
export function enableFreeze(): void {}

export const compatibilityFlags = {
  useShadowNodeWhenNecessary: false,
};

export function isSearchBarAvailableForCurrentPlatform(): boolean {
  return false;
}

const passthrough = (style: Record<string, unknown> = {}) =>
  function ScreenShim(props: ShimProps) {
    return <View style={style} {...props} />;
  };

export const ScreenStack = passthrough({ flex: 1 });
export const ScreenStackItem = passthrough({ flex: 1 });
export const ScreenFooter = passthrough();
export const Screen = passthrough({ flex: 1 });
export const ScreenContainer = passthrough({ flex: 1 });
export const ScreenStackHeaderBackButtonImage = passthrough();
export const ScreenStackHeaderCenterView = passthrough();
export const ScreenStackHeaderLeftView = passthrough();
export const ScreenStackHeaderRightView = passthrough();
export const ScreenStackHeaderSearchBarView = passthrough();
export const SearchBar = passthrough();
export const Tabs = passthrough();

export default {
  enableScreens,
  enableFreeze,
  compatibilityFlags,
  isSearchBarAvailableForCurrentPlatform,
  ScreenStack,
  ScreenStackItem,
  ScreenFooter,
  Screen,
  ScreenContainer,
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderSearchBarView,
  SearchBar,
  Tabs,
};
