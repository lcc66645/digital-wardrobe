/** 看板枚举键的中文标签与展示配色（沿用品牌暖色 + 柔和区分色） */
export interface EnumMeta {
  label: string;
  color: string;
}

const PALETTE = {
  yellow: '#FFD93D',
  pink: '#FFB6C1',
  brown: '#3D2C1E',
  orange: '#F5A623',
  green: '#7BD389',
  blue: '#6C9BD2',
  purple: '#B18CDB',
  camel: '#E8B88A',
  grayBrown: '#9C8271',
  red: '#FF6B6B',
};

/** 衣物品类 */
export const CATEGORY_META: Record<string, EnumMeta> = {
  TOP: { label: '上装', color: PALETTE.yellow },
  BOTTOM: { label: '下装', color: PALETTE.blue },
  OUTERWEAR: { label: '外套', color: PALETTE.camel },
  DRESS: { label: '裙装', color: PALETTE.pink },
  SHOES: { label: '鞋履', color: PALETTE.brown },
  BAG: { label: '包袋', color: PALETTE.purple },
  ACCESSORY: { label: '配饰', color: PALETTE.green },
  OTHER: { label: '其他', color: PALETTE.grayBrown },
};

/** 衣物生命周期状态 */
export const CLOTHING_STATUS_META: Record<string, EnumMeta> = {
  IN_USE: { label: '在用', color: PALETTE.green },
  STORED: { label: '收纳', color: PALETTE.yellow },
  DONATED: { label: '捐赠', color: PALETTE.pink },
  RESOLD: { label: '转卖', color: PALETTE.orange },
  DISCARDED: { label: '丢弃', color: PALETTE.grayBrown },
};

/** 穿搭审核状态 */
export const AUDIT_META: Record<string, EnumMeta> = {
  PENDING: { label: '待审核', color: PALETTE.orange },
  APPROVED: { label: '已通过', color: PALETTE.green },
  REJECTED: { label: '已驳回', color: PALETTE.red },
};

export function metaOf(map: Record<string, EnumMeta>, key: string): EnumMeta {
  return map[key] ?? { label: key, color: PALETTE.grayBrown };
}
