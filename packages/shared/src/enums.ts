/**
 * 数字衣橱全局枚举定义
 * 前后端共享，保持与 Prisma schema 字段口径一致
 */

/** 用户状态 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

/** 性别 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

/** 衣物生命周期状态 */
export enum ClothingStatus {
  IN_USE = 'IN_USE',
  STORED = 'STORED',
  DONATED = 'DONATED',
  RESOLD = 'RESOLD',
  DISCARDED = 'DISCARDED',
}

/** 衣物品类 */
export enum ClothingCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  OUTERWEAR = 'OUTERWEAR',
  DRESS = 'DRESS',
  SHOES = 'SHOES',
  BAG = 'BAG',
  ACCESSORY = 'ACCESSORY',
  OTHER = 'OTHER',
}

/** 适用季节（可多选，用位/数组承载） */
export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER',
}

/** 穿着场合 */
export enum Occasion {
  CASUAL = 'CASUAL',
  WORK = 'WORK',
  DATE = 'DATE',
  SPORT = 'SPORT',
  FORMAL = 'FORMAL',
  HOME = 'HOME',
  OTHER = 'OTHER',
}

/** 穿搭心情 */
export enum Mood {
  HAPPY = 'HAPPY',
  CALM = 'CALM',
  ENERGETIC = 'ENERGETIC',
  LAZY = 'LAZY',
  CONFIDENT = 'CONFIDENT',
  SAD = 'SAD',
  OTHER = 'OTHER',
}

/** 内容审核状态 */
export enum AuditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** 通知类型 */
export enum NotificationType {
  RECOMMEND = 'RECOMMEND',
  WARDROBE = 'WARDROBE',
  INTERACTION = 'INTERACTION',
  DEVICE = 'DEVICE',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM',
}

/** 硬件设备在线状态 */
export enum DeviceOnlineStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

/** 意见反馈类型 */
export enum FeedbackType {
  BUG = 'BUG',
  SUGGESTION = 'SUGGESTION',
  COMPLAINT = 'COMPLAINT',
  OTHER = 'OTHER',
}

/** 反馈处理状态 */
export enum FeedbackHandleStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED',
}
