import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import {
  AuditStatus,
  ClothingCategory,
  ClothingStatus,
  DeviceOnlineStatus,
  FeedbackHandleStatus,
  UserStatus,
} from '@dw/shared';
import type {
  AdminClothingVo,
  DashboardOverview,
  DashboardTrendPoint,
  DashboardVo,
  DistributionItem,
  PaginatedResult,
  Season,
} from '@dw/shared';
import { parseArray } from '../common/utils/json-field.util';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAdminClothingDto } from './dto/query-admin-clothing.dto';
import { UpdateClothingStatusDto } from './dto/update-clothing-status.dto';
import { QueryAdminUserDto } from './dto/query-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

/** 管理端用户结构：不暴露密码哈希 */
type AdminSafeUser = Omit<User, 'passwordHash'>;

/** 附带所属用户摘要的衣物（Prisma include 结果类型） */
type ClothingWithOwner = Prisma.ClothingGetPayload<{
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
