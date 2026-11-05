import type { ThemeConfig } from 'antd';

/** 品牌色（与 Figma 视觉规范一致） */
export const brand = {
  yellow: '#FFD93D',
  pink: '#FFB6C1',
  cream: '#FFF8F0',
  brown: '#3D2C1E',
  pageBg: '#F5F0E8',
  yellowLight: '#FFE8A3',
  pinkLight: '#FFE4EC',
  danger: '#FF6B6B',
} as const;

/**
 * AntD 5 主题：
 * - 主色用深棕保证按钮/文字对比度，暖黄作为侧栏选中与品牌点缀
 * - 大圆角、柔和阴影，延续温暖治愈风格
 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: brand.brown,
    colorLink: brand.brown,
    colorBgLayout: brand.pageBg,
    borderRadius: 12,
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    colorText: brand.brown,
  },
  components: {
    Layout: {
      headerBg: brand.cream,
      bodyBg: brand.pageBg,
      siderBg: brand.brown,
    },
    Menu: {
      darkItemBg: brand.brown,
      darkItemSelectedBg: brand.yellow,
      darkItemSelectedColor: brand.brown,
      darkItemHoverColor: brand.yellow,
      darkItemColor: 'rgba(255, 248, 240, 0.75)',
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(61, 44, 30, 0.18)',
      borderRadius: 12,
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      headerBg: brand.pinkLight,
      headerColor: brand.brown,
    },
  },
};
