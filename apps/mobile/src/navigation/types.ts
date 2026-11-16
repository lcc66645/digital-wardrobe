import type { NavigatorScreenParams } from '@react-navigation/native';

/** 底部四个主 Tab 的路由参数 */
export type MainTabParamList = {
  HomeTab: undefined;
  WardrobeTab: undefined;
  RecommendTab: undefined;
  ProfileTab: undefined;
};

/** 根栈：未登录只展示登录，已登录进入主 Tab */
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
