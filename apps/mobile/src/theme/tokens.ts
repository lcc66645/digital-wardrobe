/**
 * 数字衣橱移动端视觉规范
 * 暖黄 #FFD93D + 淡粉 #FFB6C1，奶油白背景 #FFF8F0，深棕文字 #3D2C1E，大圆角柔和阴影。
 * 与 Web 后台主题色保持同一套语义命名，新增界面必须沿用。
 */

export const colors = {
  /** 主品牌暖黄 */
  yellow: '#FFD93D',
  yellowLight: '#FFE8A3',
  /** 辅助淡粉 */
  pink: '#FFB6C1',
  pinkLight: '#FFE4EC',
  /** 页面奶油白底 */
  cream: '#FFF8F0',
  /** 卡片纯白 */
  card: '#FFFFFF',
  /** 主文字深棕 */
  brown: '#3D2C1E',
  /** 次要文字 */
  brownSub: '#8A7565',
  /** 分隔线/描边 */
  line: '#E8DDD0',
  /** 危险/删除 */
  danger: '#FF6B6B',
  /** 成功/在线 */
  success: '#7BD389',
  /** 提示蓝（信息标签） */
  info: '#6C9BD2',
  white: '#FFFFFF',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
} as const;

/** 底部 Tab 与顶部安全区之外的通用阴影（柔和） */
export const shadow = {
  card: {
    shadowColor: '#3D2C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
