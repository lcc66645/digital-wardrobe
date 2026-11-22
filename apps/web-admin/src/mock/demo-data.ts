/**
 * 管理端离线演示数据（仅在 VITE_DEMO_MODE=true 的生产构建中使用）
 * 时间字段统一为 ISO 字符串，字段名与 shared 各 VO 对齐
 */
import {
  AuditStatus,
  ClothingCategory,
  ClothingStatus,
  DeviceOnlineStatus,
  Gender,
  Mood,
  Occasion,
  Season,
  UserStatus,
} from '@dw/shared';

const T = '2026-11-22T04:00:00.000Z';

/** 当前登录的管理员 */
export const demoAdmin = {
  id: 'admin-1',
  nickname: '管理员',
  phone: '13900000001',
  wechatOpenId: null,
  appleId: null,
  avatar: null,
  gender: Gender.FEMALE,
  signature: '数字衣橱运营管理',
  city: '杭州',
  height: 165,
  style: '平台运营',
  passwordHash: null,
  status: UserStatus.ACTIVE,
  createdAt: T,
  updatedAt: T,
};

/** 用户列表（8 人，含 1 个封禁账号） */
export const demoUsers = [
  demoAdmin,
  { id: 'u-2', nickname: '林小衣', phone: '13900000002', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.FEMALE, signature: '把每一件衣服都穿到回本', city: '杭州', height: 165, style: '温柔通勤', passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-09-12T03:10:00.000Z', updatedAt: T },
  { id: 'u-3', nickname: '陈默', phone: '13900000003', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.MALE, signature: '少即是多', city: '上海', height: 180, style: '极简通勤', passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-09-20T08:30:00.000Z', updatedAt: T },
  { id: 'u-4', nickname: '苏晚', phone: '13900000004', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.FEMALE, signature: '复古是一种循环', city: '成都', height: 162, style: '复古甜妹', passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-10-02T09:00:00.000Z', updatedAt: T },
  { id: 'u-5', nickname: '周野', phone: '13900000005', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.MALE, signature: '周末去山里', city: '杭州', height: 178, style: '山系户外', passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-10-08T02:40:00.000Z', updatedAt: T },
  { id: 'u-6', nickname: '何田田', phone: '13900000006', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.FEMALE, signature: null, city: '广州', height: 168, style: '法式优雅', passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-10-15T07:20:00.000Z', updatedAt: T },
  { id: 'u-7', nickname: '高磊', phone: '13900000007', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.MALE, signature: null, city: '北京', height: 175, style: null, passwordHash: null, status: UserStatus.BANNED, createdAt: '2026-10-28T06:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z' },
  { id: 'u-8', nickname: '江予', phone: '13900000008', wechatOpenId: null, appleId: null, avatar: null, gender: Gender.UNKNOWN, signature: null, city: '深圳', height: null, style: null, passwordHash: null, status: UserStatus.ACTIVE, createdAt: '2026-11-10T05:30:00.000Z', updatedAt: T },
];

/** 衣物库（12 件，覆盖 8 品类、5 态） */
export const demoClothing = [
  { id: 'c-1', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', name: '起球旧毛衣', category: ClothingCategory.TOP, color: '灰', seasons: [Season.WINTER], occasion: Occasion.HOME, imageUrl: null, purchasePrice: 129, wearCount: 88, status: ClothingStatus.DISCARDED, tags: ['居家', '保暖'], createdAt: '2026-09-15T03:00:00.000Z', updatedAt: T },
  { id: 'c-2', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', name: '金属细框眼镜', category: ClothingCategory.ACCESSORY, color: '金', seasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER], occasion: Occasion.WORK, imageUrl: null, purchasePrice: 259, wearCount: 70, status: ClothingStatus.IN_USE, tags: ['通勤', '配饰'], createdAt: '2026-09-16T03:00:00.000Z', updatedAt: T },
  { id: 'c-3', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', name: '燕麦色西装外套', category: ClothingCategory.OUTERWEAR, color: '燕麦', seasons: [Season.SPRING, Season.AUTUMN], occasion: Occasion.WORK, imageUrl: null, purchasePrice: 499, wearCount: 9, status: ClothingStatus.IN_USE, tags: ['通勤', '叠穿'], createdAt: '2026-10-01T03:00:00.000Z', updatedAt: T },
  { id: 'c-4', userId: 'u-3', ownerName: '陈默', ownerPhone: '13900000003', name: '直筒牛仔裤', category: ClothingCategory.BOTTOM, color: '深蓝', seasons: [Season.SPRING, Season.AUTUMN], occasion: Occasion.CASUAL, imageUrl: null, purchasePrice: 299, wearCount: 45, status: ClothingStatus.IN_USE, tags: ['休闲', '百搭'], createdAt: '2026-09-25T03:00:00.000Z', updatedAt: T },
  { id: 'c-5', userId: 'u-3', ownerName: '陈默', ownerPhone: '13900000003', name: '白色基础T恤', category: ClothingCategory.TOP, color: '白', seasons: [Season.SUMMER], occasion: Occasion.CASUAL, imageUrl: null, purchasePrice: 79, wearCount: 52, status: ClothingStatus.IN_USE, tags: ['基础款'], createdAt: '2026-09-26T03:00:00.000Z', updatedAt: T },
  { id: 'c-6', userId: 'u-4', ownerName: '苏晚', ownerPhone: '13900000004', name: '碎花连衣裙', category: ClothingCategory.DRESS, color: '粉', seasons: [Season.SPRING, Season.SUMMER], occasion: Occasion.DATE, imageUrl: null, purchasePrice: 329, wearCount: 12, status: ClothingStatus.STORED, tags: ['约会', '碎花'], createdAt: '2026-10-05T03:00:00.000Z', updatedAt: T },
  { id: 'c-7', userId: 'u-4', ownerName: '苏晚', ownerPhone: '13900000004', name: '复古格纹半裙', category: ClothingCategory.BOTTOM, color: '棕格', seasons: [Season.AUTUMN], occasion: Occasion.WORK, imageUrl: null, purchasePrice: 219, wearCount: 18, status: ClothingStatus.IN_USE, tags: ['复古', '通勤'], createdAt: '2026-10-06T03:00:00.000Z', updatedAt: T },
  { id: 'c-8', userId: 'u-5', ownerName: '周野', ownerPhone: '13900000005', name: '冲锋衣', category: ClothingCategory.OUTERWEAR, color: '军绿', seasons: [Season.AUTUMN, Season.WINTER], occasion: Occasion.SPORT, imageUrl: null, purchasePrice: 899, wearCount: 23, status: ClothingStatus.IN_USE, tags: ['户外', '防风'], createdAt: '2026-10-09T03:00:00.000Z', updatedAt: T },
  { id: 'c-9', userId: 'u-5', ownerName: '周野', ownerPhone: '13900000005', name: '徒步鞋', category: ClothingCategory.SHOES, color: '灰', seasons: [Season.SPRING, Season.AUTUMN], occasion: Occasion.SPORT, imageUrl: null, purchasePrice: 599, wearCount: 31, status: ClothingStatus.IN_USE, tags: ['户外', '防滑'], createdAt: '2026-10-10T03:00:00.000Z', updatedAt: T },
  { id: 'c-10', userId: 'u-6', ownerName: '何田田', ownerPhone: '13900000006', name: '真丝衬衫', category: ClothingCategory.TOP, color: '香槟', seasons: [Season.SUMMER], occasion: Occasion.FORMAL, imageUrl: null, purchasePrice: 599, wearCount: 2, status: ClothingStatus.RESOLD, tags: ['正式', '质感'], createdAt: '2026-10-16T03:00:00.000Z', updatedAt: T },
  { id: 'c-11', userId: 'u-6', ownerName: '何田田', ownerPhone: '13900000006', name: '帆布托特包', category: ClothingCategory.BAG, color: '卡其', seasons: [Season.SPRING, Season.SUMMER, Season.AUTUMN], occasion: Occasion.WORK, imageUrl: null, purchasePrice: 159, wearCount: 33, status: ClothingStatus.DONATED, tags: ['通勤', '大容量'], createdAt: '2026-10-17T03:00:00.000Z', updatedAt: T },
  { id: 'c-12', userId: 'u-8', ownerName: '江予', ownerPhone: '13900000008', name: '黑色乐福鞋', category: ClothingCategory.SHOES, color: '黑', seasons: [Season.SPRING, Season.AUTUMN, Season.WINTER], occasion: Occasion.WORK, imageUrl: null, purchasePrice: 429, wearCount: 0, status: ClothingStatus.IN_USE, tags: ['通勤'], createdAt: '2026-11-11T03:00:00.000Z', updatedAt: T },
];

/** 社区穿搭（6 条，覆盖 3 种审核状态） */
export const demoOutfits = [
  { id: 'o-1', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', date: '2026-11-20T01:00:00.000Z', mood: Mood.HAPPY, imageUrl: null, content: '燕麦西装加牛仔裤，通勤也可以很温柔', tags: ['通勤', '叠穿'], isPublished: true, auditStatus: AuditStatus.APPROVED, likeCount: 24, commentCount: 3, createdAt: '2026-11-20T01:10:00.000Z', updatedAt: T },
  { id: 'o-2', userId: 'u-4', ownerName: '苏晚', ownerPhone: '13900000004', date: '2026-11-19T02:00:00.000Z', mood: Mood.CALM, imageUrl: null, content: '复古格纹半裙的秋日搭配', tags: ['复古'], isPublished: true, auditStatus: AuditStatus.PENDING, likeCount: 0, commentCount: 0, createdAt: '2026-11-19T02:10:00.000Z', updatedAt: T },
  { id: 'o-3', userId: 'u-5', ownerName: '周野', ownerPhone: '13900000005', date: '2026-11-18T03:00:00.000Z', mood: Mood.ENERGETIC, imageUrl: null, content: '周末徒步，冲锋衣加徒步鞋', tags: ['户外', '运动'], isPublished: true, auditStatus: AuditStatus.APPROVED, likeCount: 18, commentCount: 1, createdAt: '2026-11-18T03:10:00.000Z', updatedAt: T },
  { id: 'o-4', userId: 'u-3', ownerName: '陈默', ownerPhone: '13900000003', date: '2026-11-17T04:00:00.000Z', mood: Mood.CONFIDENT, imageUrl: null, content: '极简黑白配，开会气场拉满', tags: ['极简', '正式'], isPublished: false, auditStatus: AuditStatus.PENDING, likeCount: 0, commentCount: 0, createdAt: '2026-11-17T04:10:00.000Z', updatedAt: T },
  { id: 'o-5', userId: 'u-6', ownerName: '何田田', ownerPhone: '13900000006', date: '2026-11-16T05:00:00.000Z', mood: Mood.OTHER, imageUrl: null, content: '一条不太成功的营销风穿搭', tags: ['正式'], isPublished: true, auditStatus: AuditStatus.REJECTED, likeCount: 1, commentCount: 0, createdAt: '2026-11-16T05:10:00.000Z', updatedAt: T },
  { id: 'o-6', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', date: '2026-11-15T06:00:00.000Z', mood: Mood.LAZY, imageUrl: null, content: null, tags: ['居家'], isPublished: false, auditStatus: AuditStatus.REJECTED, likeCount: 0, commentCount: 0, createdAt: '2026-11-15T06:10:00.000Z', updatedAt: T },
];

/** 评论（挂在 o-1 下） */
export const demoComments = [
  { id: 'cm-1', outfitId: 'o-1', userId: 'u-4', ownerName: '苏晚', ownerPhone: '13900000004', content: '这个配色好温柔，求链接', parentId: null, likeCount: 5, createdAt: '2026-11-20T05:00:00.000Z' },
  { id: 'cm-2', outfitId: 'o-1', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', content: '西装是燕麦色那件，很好搭', parentId: 'cm-1', likeCount: 2, createdAt: '2026-11-20T05:30:00.000Z' },
  { id: 'cm-3', outfitId: 'o-1', userId: 'u-5', ownerName: '周野', ownerPhone: '13900000005', content: '通勤可以参考', parentId: null, likeCount: 1, createdAt: '2026-11-20T06:00:00.000Z' },
];

/** 硬件设备（5 台，含未绑定） */
export const demoDevices = [
  { id: 'd-1', sn: 'DW-SN-20260001', userId: 'u-2', ownerName: '林小衣', ownerPhone: '13900000002', firmwareVersion: '1.4.2', battery: 86, onlineStatus: DeviceOnlineStatus.ONLINE, lastOnlineAt: '2026-11-22T03:30:00.000Z' },
  { id: 'd-2', sn: 'DW-SN-20260002', userId: 'u-3', ownerName: '陈默', ownerPhone: '13900000003', firmwareVersion: '1.4.2', battery: 42, onlineStatus: DeviceOnlineStatus.ONLINE, lastOnlineAt: '2026-11-22T03:20:00.000Z' },
  { id: 'd-3', sn: 'DW-SN-20260003', userId: 'u-5', ownerName: '周野', ownerPhone: '13900000005', firmwareVersion: '1.3.8', battery: 15, onlineStatus: DeviceOnlineStatus.OFFLINE, lastOnlineAt: '2026-11-20T11:00:00.000Z' },
  { id: 'd-4', sn: 'DW-SN-20260004', userId: 'u-7', ownerName: '高磊', ownerPhone: '13900000007', firmwareVersion: '1.3.8', battery: 67, onlineStatus: DeviceOnlineStatus.OFFLINE, lastOnlineAt: '2026-11-18T09:10:00.000Z' },
  { id: 'd-5', sn: 'DW-SN-20260005', userId: null, ownerName: null, ownerPhone: null, firmwareVersion: '1.4.2', battery: 99, onlineStatus: DeviceOnlineStatus.ONLINE, lastOnlineAt: null },
];

/** 近 7 天新增趋势 */
export const demoTrend = [
  { date: '2026-11-16', newUsers: 1, newOutfits: 1 },
  { date: '2026-11-17', newUsers: 0, newOutfits: 1 },
  { date: '2026-11-18', newUsers: 0, newOutfits: 1 },
  { date: '2026-11-19', newUsers: 0, newOutfits: 1 },
  { date: '2026-11-20', newUsers: 0, newOutfits: 1 },
  { date: '2026-11-21', newUsers: 1, newOutfits: 0 },
  { date: '2026-11-22', newUsers: 0, newOutfits: 1 },
];
