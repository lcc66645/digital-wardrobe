import { ClothingCategory, ClothingStatus, Season } from '@dw/shared';
import type { Clothing, Occasion, PaginatedResult } from '@dw/shared';
import { get } from './client';

/**
 * 衣橱（我的衣物）接口层
 * 对应后端 ClothingController：GET /api/clothing（JWT 鉴权，仅返回当前用户衣物）。
 */

/** 线上 JSON 衣物对象：字段对齐 shared Clothing，时间字段由 Date 序列化为 ISO 字符串 */
export type ClothingDto = Omit<Clothing, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

/** 衣橱列表查询参数（GET /clothing），全部可选；page 从 1 开始 */
export interface ClothingQuery {
  page?: number;
  pageSize?: number;
  category?: ClothingCategory;
  status?: ClothingStatus;
  occasion?: Occasion;
  season?: Season;
  /** 关键词：匹配名称 / 颜色 / 标签，最长 30 字（后端校验） */
  keyword?: string;
}

/** 分页结果，复用 shared 泛型分页结构：{ list, total, page, pageSize, totalPages } */
export type ClothingPage = PaginatedResult<ClothingDto>;

/** 分页查询我的衣物，对应 GET /api/clothing */
export function getMyClothing(params: ClothingQuery): Promise<ClothingPage> {
  // 展开为普通对象字面量，规避具名 interface 不可赋给 Record<string, unknown> 的类型限制
  return get<ClothingPage>('/clothing', { ...params });
}

/** 品类筛选 chip：顺序即横向展示顺序；value 缺省（全部）表示不传 category */
export const CATEGORY_FILTERS: ReadonlyArray<{
  label: string;
  value?: ClothingCategory;
}> = [
  { label: '全部' },
  { label: '上衣', value: ClothingCategory.TOP },
  { label: '裤装', value: ClothingCategory.BOTTOM },
  { label: '外套', value: ClothingCategory.OUTERWEAR },
  { label: '裙装', value: ClothingCategory.DRESS },
  { label: '鞋履', value: ClothingCategory.SHOES },
  { label: '包袋', value: ClothingCategory.BAG },
  { label: '配饰', value: ClothingCategory.ACCESSORY },
  { label: '其他', value: ClothingCategory.OTHER },
];

/** 生命周期状态中文与标签底色（在用 / 收纳 / 捐赠 / 转卖 / 丢弃），功能色后续可收敛进 tokens */
export const CLOTHING_STATUS_META: Record<
  ClothingStatus,
  { label: string; bg: string; fg: string }
> = {
  [ClothingStatus.IN_USE]: { label: '在用', bg: '#E4F6E6', fg: '#4E9E63' },
  [ClothingStatus.STORED]: { label: '收纳', bg: '#EAF1F8', fg: '#5B7FA6' },
  [ClothingStatus.DONATED]: { label: '已捐赠', bg: '#F1ECE6', fg: '#8A7565' },
  [ClothingStatus.RESOLD]: { label: '已转卖', bg: '#F1ECE6', fg: '#8A7565' },
  [ClothingStatus.DISCARDED]: { label: '已丢弃', bg: '#FBE9E9', fg: '#C06060' },
};

/** 季节中文单字映射（一件衣物可适用于多个季节，卡片以小标签横排） */
export const SEASON_LABEL: Record<Season, string> = {
  [Season.SPRING]: '春',
  [Season.SUMMER]: '夏',
  [Season.AUTUMN]: '秋',
  [Season.WINTER]: '冬',
};

/** 品类中文映射（与筛选 chip 文案保持同一口径） */
export const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  [ClothingCategory.TOP]: '上衣',
  [ClothingCategory.BOTTOM]: '裤装',
  [ClothingCategory.OUTERWEAR]: '外套',
  [ClothingCategory.DRESS]: '裙装',
  [ClothingCategory.SHOES]: '鞋履',
  [ClothingCategory.BAG]: '包袋',
  [ClothingCategory.ACCESSORY]: '配饰',
  [ClothingCategory.OTHER]: '其他',
};

/** 穿着场合中文映射 */
export const OCCASION_LABEL: Record<Occasion, string> = {
  CASUAL: '日常休闲',
  WORK: '通勤办公',
  DATE: '约会',
  SPORT: '运动',
  FORMAL: '正式场合',
  HOME: '居家',
  OTHER: '其他',
};
