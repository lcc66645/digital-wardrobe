/**
 * 核心实体 TS 接口
 * 字段与 Prisma 模型保持一致，供前后端共享
 */
import {
  UserStatus,
  Gender,
  ClothingStatus,
  ClothingCategory,
  Season,
  Occasion,
  Mood,
  AuditStatus,
  NotificationType,
  DeviceOnlineStatus,
  FeedbackType,
  FeedbackHandleStatus,
} from './enums';

export interface User {
  id: string;
  nickname: string;
  phone: string | null;
  wechatOpenId: string | null;
  appleId: string | null;
  avatar: string | null;
  gender: Gender;
  signature: string | null;
  city: string | null;
  height: number | null;
  style: string | null;
  passwordHash: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Clothing {
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  color: string | null;
  seasons: Season[];
  occasion: Occasion | null;
  imageUrl: string | null;
  purchasePrice: number | null;
  wearCount: number;
  status: ClothingStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** 管理端衣物视图：在衣物字段基础上附带所属用户摘要（昵称/手机号），seasons/tags 已解析为数组 */
export interface AdminClothingVo {
  id: string;
  userId: string;
  ownerName: string;
  ownerPhone: string | null;
  name: string;
  category: ClothingCategory;
  color: string | null;
  seasons: Season[];
  occasion: Occasion | null;
  imageUrl: string | null;
  purchasePrice: number | null;
  wearCount: number;
  status: ClothingStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Outfit {
  id: string;
  userId: string;
  date: Date;
  mood: Mood | null;
  imageUrl: string | null;
  content: string | null;
  tags: string[];
  isPublished: boolean;
  auditStatus: AuditStatus;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutfitItem {
  id: string;
  outfitId: string;
  clothingId: string;
}

export interface Comment {
  id: string;
  outfitId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likeCount: number;
  createdAt: Date;
}

export interface Like {
  userId: string;
  outfitId: string;
}

export interface Favorite {
  userId: string;
  outfitId: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export interface Device {
  id: string;
  sn: string;
  userId: string | null;
  firmwareVersion: string | null;
  battery: number | null;
  onlineStatus: DeviceOnlineStatus;
  lastOnlineAt: Date | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  content: string;
  screenshot: string | null;
  contact: string | null;
  handleStatus: FeedbackHandleStatus;
  createdAt: Date;
}

// ---------------- Web 管理后台聚合视图 ----------------

/** 看板总览计数 */
export interface DashboardOverview {
  /** 用户总数 */
  userTotal: number;
  /** 封禁用户数 */
  bannedUserCount: number;
  /** 衣物总数 */
  clothingTotal: number;
  /** 穿搭总数 */
  outfitTotal: number;
  /** 已发布穿搭数 */
  publishedOutfitCount: number;
  /** 待审核穿搭数 */
  pendingAuditCount: number;
  /** 设备总数 */
  deviceTotal: number;
  /** 在线设备数 */
  onlineDeviceCount: number;
  /** 待处理反馈数 */
  pendingFeedbackCount: number;
}

/** 枚举键值分布项 */
export interface DistributionItem {
  /** 枚举键（取值见对应枚举） */
  key: string;
  /** 数量 */
  count: number;
}

/** 近 7 天趋势单日数据 */
export interface DashboardTrendPoint {
  /** 日期，格式 yyyy-mm-dd */
  date: string;
  /** 当日新增用户数 */
  newUsers: number;
  /** 当日新增穿搭数 */
  newOutfits: number;
}

/** 数据看板聚合视图（GET admin/dashboard） */
export interface DashboardVo {
  overview: DashboardOverview;
  /** 近 7 天新增趋势（按天，含零值天） */
  trend: DashboardTrendPoint[];
  /** 衣物按品类分布（8 类，补全零值） */
  clothingByCategory: DistributionItem[];
  /** 衣物按生命周期状态分布（5 种，补全零值） */
  clothingByStatus: DistributionItem[];
  /** 穿搭按审核状态分布（3 种，补全零值） */
  outfitByAudit: DistributionItem[];
  /** 聚合生成时间 */
  generatedAt: Date;
}
