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
