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

/** 管理端穿搭视图：在穿搭字段基础上附带作者摘要（昵称/手机号），tags 已解析为数组 */
export interface AdminOutfitVo {
  id: string;
  userId: string;
  ownerName: string;
  ownerPhone: string | null;
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

/** 管理端评论视图：在评论字段基础上附带作者摘要（昵称/手机号） */
export interface AdminCommentVo {
  id: string;
  outfitId: string;
  userId: string;
  ownerName: string;
  ownerPhone: string | null;
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

/** 管理端设备视图：设备字段 + 绑定用户摘要（未绑定时 ownerName/ownerPhone 为 null） */
export interface AdminDeviceVo {
  id: string;
  sn: string;
  userId: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
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

// ---------------- 算法管理（推荐数据底座 + 策略口径） ----------------

/** 算法推荐数据底座核心计数（全部来自真实库聚合，不含估算的线上效果指标） */
export interface AlgorithmBaseMetrics {
  /** 全部衣物数 */
  clothingTotal: number;
  /** 可进入推荐候选池的在用衣物数（status=IN_USE） */
  inUseClothingCount: number;
  /** 在用衣物累计穿着次数（wearCount 求和） */
  totalWearCount: number;
  /** 在用衣物平均穿着次数（保留 1 位小数） */
  avgWearCount: number;
  /** 在用但从未穿着（wearCount=0）的闲置衣物数 */
  idleClothingCount: number;
  /** 穿搭组合总数 */
  outfitTotal: number;
  /** 已发布且审核通过、可进入社区/推荐内容池的穿搭数 */
  publicOutfitCount: number;
}

/** 品类完备度项：在用数量 + 是否必备 + 是否缺口 */
export interface CategoryCoverageItem {
  /** 衣物品类键（ClothingCategory） */
  category: string;
  /** 在用数量 */
  count: number;
  /** 是否为搭配必备品类 */
  required: boolean;
  /** 必备品类在用数量为 0 时为缺口 */
  gap: boolean;
}

/** 推荐策略规则口径项（只读产品规则说明，非运行时可调参数） */
export interface AlgorithmRuleItem {
  /** 规则环节，如 候选过滤 / 品类补齐 */
  stage: string;
  /** 规则名称 */
  name: string;
  /** 规则口径说明 */
  description: string;
  /** 落地状态：ACTIVE 已生效 / PLANNED 规划中（依赖外部数据或后续迭代） */
  status: 'ACTIVE' | 'PLANNED';
}

/** 算法管理聚合视图（GET admin/algorithm/overview） */
export interface AlgorithmOverviewVo {
  metrics: AlgorithmBaseMetrics;
  /** 在用衣物品类完备度（8 类，补全零值，含必备/缺口标记） */
  categoryCoverage: CategoryCoverageItem[];
  /** 在用衣物季节分布（4 季；一件多季会重复计入，按季节打标计数） */
  seasonDistribution: DistributionItem[];
  /** 在用衣物场合分布（7 种，补全零值；未设置场合不计入，见 occasionUnsetCount） */
  occasionDistribution: DistributionItem[];
  /** 未设置场合的在用衣物数 */
  occasionUnsetCount: number;
  /** 全量衣物生命周期分布（5 态，补全零值） */
  lifecycleDistribution: DistributionItem[];
  /** 当前推荐策略规则口径（只读） */
  rules: AlgorithmRuleItem[];
  /** 聚合生成时间 */
  generatedAt: Date;
}
