import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import {
  AuditStatus,
  ClothingCategory,
  ClothingStatus,
  DeviceOnlineStatus,
  FeedbackHandleStatus,
  Occasion,
  Season,
  UserStatus,
} from '@dw/shared';
import type {
  AdminClothingVo,
  AdminCommentVo,
  AdminDeviceVo,
  AdminOutfitVo,
  AlgorithmOverviewVo,
  AlgorithmRuleItem,
  CategoryCoverageItem,
  DashboardOverview,
  DashboardTrendPoint,
  DashboardVo,
  DistributionItem,
  Mood,
  PaginatedResult,
} from '@dw/shared';
import { parseArray } from '../common/utils/json-field.util';
import { PrismaService } from '../prisma/prisma.service';
import { AuditOutfitDto } from './dto/audit-outfit.dto';
import { QueryAdminClothingDto } from './dto/query-admin-clothing.dto';
import { QueryAdminDeviceDto } from './dto/query-admin-device.dto';
import { UpdateClothingStatusDto } from './dto/update-clothing-status.dto';
import { QueryAdminOutfitDto } from './dto/query-admin-outfit.dto';
import { QueryAdminUserDto } from './dto/query-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

/** 管理端用户结构：不暴露密码哈希 */
type AdminSafeUser = Omit<User, 'passwordHash'>;

/** 附带所属用户摘要的衣物（Prisma include 结果类型） */
type ClothingWithOwner = Prisma.ClothingGetPayload<{
  include: { user: { select: { nickname: true; phone: true } } };
}>;

/** 附带作者摘要的穿搭（Prisma include 结果类型） */
type OutfitWithOwner = Prisma.OutfitGetPayload<{
  include: { user: { select: { nickname: true; phone: true } } };
}>;

/** 附带作者摘要的评论（Prisma include 结果类型） */
type CommentWithOwner = Prisma.CommentGetPayload<{
  include: { user: { select: { nickname: true; phone: true } } };
}>;

/** 附带绑定用户摘要的设备（Prisma include 结果类型） */
type DeviceWithOwner = Prisma.DeviceGetPayload<{
  include: { user: { select: { nickname: true; phone: true } } };
}>;

/** 本地日期键 yyyy-mm-dd（按运行环境本地时区，不依赖数据库日期函数，跨库一致） */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** 数据看板聚合：总览计数 + 近 7 天趋势 + 三类枚举分布 */
  async getDashboard(): Promise<DashboardVo> {
    const [overview, clothingByCategory, clothingByStatus, outfitByAudit, trend] =
      await Promise.all([
        this.buildOverview(),
        this.buildCategoryDistribution(),
        this.buildStatusDistribution(),
        this.buildAuditDistribution(),
        this.buildTrend(),
      ]);

    return {
      overview,
      trend,
      clothingByCategory,
      clothingByStatus,
      outfitByAudit,
      generatedAt: new Date(),
    };
  }

  /** 管理端用户分页列表：支持按状态、昵称/手机号关键词过滤，返回脱敏用户 */
  async listUsers(
    q: QueryAdminUserDto,
  ): Promise<PaginatedResult<AdminSafeUser>> {
    const where: Prisma.UserWhereInput = {};
    if (q.status) where.status = q.status;
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.OR = [
        { nickname: { contains: kw } },
        { phone: { contains: kw } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      list: rows.map((r) => this.toSafeUser(r)),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 封禁/解封用户：切换状态；禁止管理员封禁当前登录账号，目标不存在返回 404 */
  async setUserStatus(
    targetId: string,
    dto: UpdateUserStatusDto,
    currentUserId: string,
  ): Promise<AdminSafeUser> {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) {
      throw new NotFoundException('用户不存在');
    }
    if (targetId === currentUserId && dto.status === UserStatus.BANNED) {
      throw new BadRequestException('不能封禁当前登录的管理员账号');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { status: dto.status },
    });
    return this.toSafeUser(updated);
  }

  /** 管理端衣物分页：跨用户，按品类/状态/所属用户/关键词过滤，附带所属用户摘要 */
  async listClothing(
    q: QueryAdminClothingDto,
  ): Promise<PaginatedResult<AdminClothingVo>> {
    const where: Prisma.ClothingWhereInput = {};
    if (q.category) where.category = q.category;
    if (q.status) where.status = q.status;
    if (q.userId) where.userId = q.userId;
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.OR = [{ name: { contains: kw } }, { color: { contains: kw } }];
    }

    const [total, rows] = await Promise.all([
      this.prisma.clothing.count({ where }),
      this.prisma.clothing.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { nickname: true, phone: true } } },
      }),
    ]);

    return {
      list: rows.map((r) => this.toAdminClothingVo(r)),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 调整衣物生命周期状态：目标不存在返回 404，写入幂等 */
  async setClothingStatus(
    id: string,
    dto: UpdateClothingStatusDto,
  ): Promise<AdminClothingVo> {
    const existing = await this.prisma.clothing.findUnique({
      where: { id },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    if (!existing) {
      throw new NotFoundException('衣物不存在');
    }

    const updated = await this.prisma.clothing.update({
      where: { id },
      data: { status: dto.status },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    return this.toAdminClothingVo(updated);
  }

  /** 管理端穿搭分页：跨用户，按审核状态/作者/关键词过滤，附带作者摘要 */
  async listOutfits(
    q: QueryAdminOutfitDto,
  ): Promise<PaginatedResult<AdminOutfitVo>> {
    const where: Prisma.OutfitWhereInput = {};
    if (q.auditStatus) where.auditStatus = q.auditStatus;
    if (q.userId) where.userId = q.userId;
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.content = { contains: kw };
    }

    const [total, rows] = await Promise.all([
      this.prisma.outfit.count({ where }),
      this.prisma.outfit.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { nickname: true, phone: true } } },
      }),
    ]);

    return {
      list: rows.map((r) => this.toAdminOutfitVo(r)),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 穿搭审核：通过/驳回，目标不存在返回 404，写入幂等；只改审核状态，不删除内容、不强制改发布标记 */
  async auditOutfit(id: string, dto: AuditOutfitDto): Promise<AdminOutfitVo> {
    const existing = await this.prisma.outfit.findUnique({
      where: { id },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    if (!existing) {
      throw new NotFoundException('穿搭不存在');
    }

    const updated = await this.prisma.outfit.update({
      where: { id },
      data: { auditStatus: dto.auditStatus },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    return this.toAdminOutfitVo(updated);
  }

  /** 查看某条穿搭的全部评论（含作者摘要），按创建时间正序；穿搭不存在返回 404 */
  async listOutfitComments(outfitId: string): Promise<AdminCommentVo[]> {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: outfitId },
      select: { id: true },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }

    const rows = await this.prisma.comment.findMany({
      where: { outfitId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    return rows.map((r) => this.toAdminCommentVo(r));
  }

  /** 管理端设备分页：跨用户，按在线状态/绑定用户/关键词（SN/固件）过滤，附带绑定用户摘要 */
  async listDevices(
    q: QueryAdminDeviceDto,
  ): Promise<PaginatedResult<AdminDeviceVo>> {
    const where: Prisma.DeviceWhereInput = {};
    if (q.onlineStatus) where.onlineStatus = q.onlineStatus;
    if (q.userId) where.userId = q.userId;
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.OR = [
        { sn: { contains: kw } },
        { firmwareVersion: { contains: kw } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.device.count({ where }),
      this.prisma.device.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: [{ lastOnlineAt: 'desc' }, { sn: 'asc' }],
        include: { user: { select: { nickname: true, phone: true } } },
      }),
    ]);

    return {
      list: rows.map((r) => this.toAdminDeviceVo(r)),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 管理员强制解绑：目标不存在返回 404；解绑后 userId 置空、状态置离线，未绑定设备调用幂等 */
  async unbindDevice(id: string): Promise<AdminDeviceVo> {
    const existing = await this.prisma.device.findUnique({
      where: { id },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    if (!existing) {
      throw new NotFoundException('设备不存在');
    }

    const updated = await this.prisma.device.update({
      where: { id },
      data: { userId: null, onlineStatus: DeviceOnlineStatus.OFFLINE },
      include: { user: { select: { nickname: true, phone: true } } },
    });
    return this.toAdminDeviceVo(updated);
  }

  /** 搭配必备品类：缺少这些品类难以独立成组一套日常搭配 */
  private static readonly REQUIRED_CATEGORIES: ClothingCategory[] = [
    ClothingCategory.TOP,
    ClothingCategory.BOTTOM,
    ClothingCategory.OUTERWEAR,
    ClothingCategory.SHOES,
  ];

  /** 推荐策略规则口径（只读产品规则，与 PRD/审查结论一致；非数据库可调参数） */
  private static readonly ALGORITHM_RULES: AlgorithmRuleItem[] = [
    {
      stage: '候选过滤',
      name: '在用候选池',
      description:
        '仅生命周期为「在用 IN_USE」的衣物进入推荐候选；收纳、捐赠、转卖、丢弃状态不参与搭配推荐。',
      status: 'ACTIVE',
    },
    {
      stage: '品类补齐',
      name: '成套可行性',
      description:
        '一套推荐需覆盖上装、下装（连衣裙可替代上下装）与鞋履，外套按季节/温差补齐；必备品类空缺时减少该方向组合并提示补充单品。',
      status: 'ACTIVE',
    },
    {
      stage: '季节匹配',
      name: '时令适配',
      description:
        '按衣物适用季节 seasons 与当前季节匹配；反季单品降权而非完全屏蔽，兼顾叠穿与早晚温差。',
      status: 'ACTIVE',
    },
    {
      stage: '场合匹配',
      name: '场景适配',
      description:
        '按衣物场合 occasion 匹配当日场景：通勤 WORK、休闲 CASUAL、约会 DATE、运动 SPORT、正式 FORMAL、居家 HOME。',
      status: 'ACTIVE',
    },
    {
      stage: '利用率因子',
      name: '闲置盘活',
      description:
        '同等匹配度下优先提升穿着次数少的单品曝光，避免高频单品反复堆砌，提升衣橱整体利用率。',
      status: 'ACTIVE',
    },
    {
      stage: '成本因子',
      name: '单次穿着成本',
      description:
        '单次穿着成本 = 购入价 ÷（穿着次数 + 1）；成本越高且穿着越少的单品优先获得搭配曝光，引导盘活高价值闲置。',
      status: 'ACTIVE',
    },
    {
      stage: '负反馈降权',
      name: '不感兴趣反馈',
      description:
        '用户对推荐选择「不喜欢 / 换一批」后，相似品类、颜色与风格组合进入短期降权，不连续重复推荐。',
      status: 'ACTIVE',
    },
    {
      stage: '天气与心情',
      name: '情境因子',
      description:
        '结合实时天气温度、降水与用户当日心情 mood 调整厚薄、配色与风格；该能力依赖天气数据接入，当前为规划中。',
      status: 'PLANNED',
    },
  ];

  /** 算法管理聚合：推荐数据底座计数 + 品类完备度 + 季节/场合/生命周期分布 + 策略口径 */
  async getAlgorithmOverview(): Promise<AlgorithmOverviewVo> {
    const [inUseRows, clothingTotal, outfitTotal, publicOutfitCount, lifecycleDistribution] =
      await Promise.all([
        this.prisma.clothing.findMany({
          where: { status: ClothingStatus.IN_USE },
          select: { category: true, seasons: true, occasion: true, wearCount: true },
        }),
        this.prisma.clothing.count(),
        this.prisma.outfit.count(),
        this.prisma.outfit.count({
          where: { isPublished: true, auditStatus: AuditStatus.APPROVED },
        }),
        this.buildStatusDistribution(),
      ]);

    const inUseClothingCount = inUseRows.length;
    const totalWearCount = inUseRows.reduce((sum, r) => sum + r.wearCount, 0);
    const avgWearCount = inUseClothingCount
      ? Math.round((totalWearCount / inUseClothingCount) * 10) / 10
      : 0;
    const idleClothingCount = inUseRows.filter((r) => r.wearCount === 0).length;

    const categoryCount = new Map<string, number>();
    const seasonCount = new Map<string, number>();
    const occasionCount = new Map<string, number>();
    let occasionUnsetCount = 0;

    inUseRows.forEach((r) => {
      categoryCount.set(r.category, (categoryCount.get(r.category) ?? 0) + 1);
      parseArray<Season>(r.seasons).forEach((s) => {
        seasonCount.set(s, (seasonCount.get(s) ?? 0) + 1);
      });
      if (r.occasion) {
        occasionCount.set(r.occasion, (occasionCount.get(r.occasion) ?? 0) + 1);
      } else {
        occasionUnsetCount += 1;
      }
    });

    const categoryCoverage: CategoryCoverageItem[] = Object.values(ClothingCategory).map(
      (c) => {
        const count = categoryCount.get(c) ?? 0;
        const required = AdminService.REQUIRED_CATEGORIES.includes(c);
        return { category: c, count, required, gap: required && count === 0 };
      },
    );

    const seasonDistribution = this.fillDistribution(
      Object.values(Season),
      Object.values(Season).map((s) => ({ key: s, count: seasonCount.get(s) ?? 0 })),
    );
    const occasionDistribution = this.fillDistribution(
      Object.values(Occasion),
      Object.values(Occasion).map((o) => ({ key: o, count: occasionCount.get(o) ?? 0 })),
    );

    return {
      metrics: {
        clothingTotal,
        inUseClothingCount,
        totalWearCount,
        avgWearCount,
        idleClothingCount,
        outfitTotal,
        publicOutfitCount,
      },
      categoryCoverage,
      seasonDistribution,
      occasionDistribution,
      occasionUnsetCount,
      lifecycleDistribution,
      rules: AdminService.ALGORITHM_RULES,
      generatedAt: new Date(),
    };
  }

  /** 衣物实体转管理端视图：解析 seasons/tags，枚举字段断言，附所属用户摘要 */
  private toAdminClothingVo(c: ClothingWithOwner): AdminClothingVo {
    return {
      id: c.id,
      userId: c.userId,
      ownerName: c.user.nickname,
      ownerPhone: c.user.phone,
      name: c.name,
      category: c.category as AdminClothingVo['category'],
      color: c.color,
      seasons: parseArray<Season>(c.seasons),
      occasion: c.occasion as AdminClothingVo['occasion'],
      imageUrl: c.imageUrl,
      purchasePrice: c.purchasePrice,
      wearCount: c.wearCount,
      status: c.status as AdminClothingVo['status'],
      tags: parseArray<string>(c.tags),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  /** 穿搭实体转管理端视图：解析 tags，枚举字段断言，附作者摘要 */
  private toAdminOutfitVo(o: OutfitWithOwner): AdminOutfitVo {
    return {
      id: o.id,
      userId: o.userId,
      ownerName: o.user.nickname,
      ownerPhone: o.user.phone,
      date: o.date,
      mood: (o.mood as Mood | null) ?? null,
      imageUrl: o.imageUrl,
      content: o.content,
      tags: parseArray<string>(o.tags),
      isPublished: o.isPublished,
      auditStatus: o.auditStatus as AdminOutfitVo['auditStatus'],
      likeCount: o.likeCount,
      commentCount: o.commentCount,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }

  /** 评论实体转管理端视图，附作者摘要 */
  private toAdminCommentVo(c: CommentWithOwner): AdminCommentVo {
    return {
      id: c.id,
      outfitId: c.outfitId,
      userId: c.userId,
      ownerName: c.user.nickname,
      ownerPhone: c.user.phone,
      content: c.content,
      parentId: c.parentId,
      likeCount: c.likeCount,
      createdAt: c.createdAt,
    };
  }

  /** 设备实体转管理端视图，附绑定用户摘要（未绑定时为 null） */
  private toAdminDeviceVo(d: DeviceWithOwner): AdminDeviceVo {
    return {
      id: d.id,
      sn: d.sn,
      userId: d.userId,
      ownerName: d.user?.nickname ?? null,
      ownerPhone: d.user?.phone ?? null,
      firmwareVersion: d.firmwareVersion,
      battery: d.battery,
      onlineStatus: d.onlineStatus as AdminDeviceVo['onlineStatus'],
      lastOnlineAt: d.lastOnlineAt,
    };
  }

  /** 剥离密码哈希字段 */
  private toSafeUser(user: User): AdminSafeUser {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  /** 总览：9 项核心计数，全部并行执行 */
  private async buildOverview(): Promise<DashboardOverview> {
    const [
      userTotal,
      bannedUserCount,
      clothingTotal,
      outfitTotal,
      publishedOutfitCount,
      pendingAuditCount,
      deviceTotal,
      onlineDeviceCount,
      pendingFeedbackCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.BANNED } }),
      this.prisma.clothing.count(),
      this.prisma.outfit.count(),
      this.prisma.outfit.count({ where: { isPublished: true } }),
      this.prisma.outfit.count({ where: { auditStatus: AuditStatus.PENDING } }),
      this.prisma.device.count(),
      this.prisma.device.count({
        where: { onlineStatus: DeviceOnlineStatus.ONLINE },
      }),
      this.prisma.feedback.count({
        where: { handleStatus: FeedbackHandleStatus.PENDING },
      }),
    ]);

    return {
      userTotal,
      bannedUserCount,
      clothingTotal,
      outfitTotal,
      publishedOutfitCount,
      pendingAuditCount,
      deviceTotal,
      onlineDeviceCount,
      pendingFeedbackCount,
    };
  }

  /** 衣物按品类分布，补全 8 个枚举的零值 */
  private async buildCategoryDistribution(): Promise<DistributionItem[]> {
    const grouped = await this.prisma.clothing.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    return this.fillDistribution(
      Object.values(ClothingCategory),
      grouped.map((g) => ({ key: g.category, count: g._count._all })),
    );
  }

  /** 衣物按生命周期状态分布，补全 5 个枚举的零值 */
  private async buildStatusDistribution(): Promise<DistributionItem[]> {
    const grouped = await this.prisma.clothing.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return this.fillDistribution(
      Object.values(ClothingStatus),
      grouped.map((g) => ({ key: g.status, count: g._count._all })),
    );
  }

  /** 穿搭按审核状态分布，补全 3 个枚举的零值 */
  private async buildAuditDistribution(): Promise<DistributionItem[]> {
    const grouped = await this.prisma.outfit.groupBy({
      by: ['auditStatus'],
      _count: { _all: true },
    });
    return this.fillDistribution(
      Object.values(AuditStatus),
      grouped.map((g) => ({ key: g.auditStatus, count: g._count._all })),
    );
  }

  /**
   * 近 7 天趋势：在应用层按本地日期分桶，避免依赖 SQLite/PG 的日期截断差异。
   * 先建含零值的 7 个桶，再用查询结果填充，保证无数据日也返回。
   */
  private async buildTrend(): Promise<DashboardTrendPoint[]> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    const buckets: DashboardTrendPoint[] = [];
    const indexByKey = new Map<string, DashboardTrendPoint>();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const point: DashboardTrendPoint = {
        date: dayKey(d),
        newUsers: 0,
        newOutfits: 0,
      };
      buckets.push(point);
      indexByKey.set(point.date, point);
    }

    const [users, outfits] = await Promise.all([
      this.prisma.user.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      this.prisma.outfit.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true },
      }),
    ]);

    users.forEach((u) => {
      const point = indexByKey.get(dayKey(u.createdAt));
      if (point) point.newUsers += 1;
    });
    outfits.forEach((o) => {
      const point = indexByKey.get(dayKey(o.createdAt));
      if (point) point.newOutfits += 1;
    });

    return buckets;
  }

  /** 按枚举键顺序补全零值，返回稳定顺序的分布数组 */
  private fillDistribution(
    keys: string[],
    actual: DistributionItem[],
  ): DistributionItem[] {
    const countByKey = new Map(actual.map((a) => [a.key, a.count]));
    return keys.map((key) => ({ key, count: countByKey.get(key) ?? 0 }));
  }
}
