import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Outfit as OutfitVo, PaginatedResult } from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parseArray } from '../common/utils/json-field.util';
import { QueryInteractionDto } from './dto/query-interaction.dto';

/** 点赞切换结果：当前是否点赞 + 穿搭最新点赞数 */
export interface LikeToggleVo {
  liked: boolean;
  likeCount: number;
}

/** 收藏切换结果 */
export interface FavoriteToggleVo {
  favorited: boolean;
}

/** 收藏项：收藏关系 + 穿搭（含作者简要） */
export interface FavoriteItemVo {
  id: string;
  outfitId: string;
  createdAt: Date;
  outfit: OutfitVo & {
    user: { id: string; nickname: string; avatar: string | null };
  };
}

/** 关注切换结果 */
export interface FollowToggleVo {
  following: boolean;
}

/** 用户关系状态：是否关注 + 该用户粉丝数/关注数 */
export interface RelationStatusVo {
  following: boolean;
  followerCount: number;
  followingCount: number;
}

/** 用户简要信息（粉丝/关注列表） */
export interface UserBriefVo {
  id: string;
  nickname: string;
  avatar: string | null;
  signature: string | null;
}

@Injectable()
export class InteractionService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- 点赞 ----------------

  /** 点赞（幂等）：已点赞则不重复计数，事务内创建并累加 likeCount */
  async like(userId: string, outfitId: string): Promise<LikeToggleVo> {
    await this.requireOutfit(outfitId);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { userId_outfitId: { userId, outfitId } },
      });
      if (!existing) {
        await tx.like.create({ data: { userId, outfitId } });
        await tx.outfit.update({
          where: { id: outfitId },
          data: { likeCount: { increment: 1 } },
        });
      }
      const latest = await tx.outfit.findUnique({
        where: { id: outfitId },
        select: { likeCount: true },
      });
      return { liked: true, likeCount: latest!.likeCount };
    });
  }

  /** 取消点赞（幂等）：未点赞时不报错也不递减 */
  async unlike(userId: string, outfitId: string): Promise<LikeToggleVo> {
    await this.requireOutfit(outfitId);
    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.like.deleteMany({ where: { userId, outfitId } });
      if (deleted.count > 0) {
        await tx.outfit.update({
          where: { id: outfitId },
          data: { likeCount: { decrement: 1 } },
        });
      }
      const latest = await tx.outfit.findUnique({
        where: { id: outfitId },
        select: { likeCount: true },
      });
      return { liked: false, likeCount: latest!.likeCount };
    });
  }

  // ---------------- 收藏 ----------------

  /** 收藏（幂等）：upsert 保证重复收藏不产生多条 */
  async favorite(userId: string, outfitId: string): Promise<FavoriteToggleVo> {
    await this.requireOutfit(outfitId);
    await this.prisma.favorite.upsert({
      where: { userId_outfitId: { userId, outfitId } },
      create: { userId, outfitId },
      update: {},
    });
    return { favorited: true };
  }

  /** 取消收藏（幂等） */
  async unfavorite(userId: string, outfitId: string): Promise<FavoriteToggleVo> {
    await this.requireOutfit(outfitId);
    await this.prisma.favorite.deleteMany({ where: { userId, outfitId } });
    return { favorited: false };
  }

  /** 我的收藏列表（分页，按收藏时间倒序，含穿搭与作者） */
  async listFavorites(
    userId: string,
    q: QueryInteractionDto,
  ): Promise<PaginatedResult<FavoriteItemVo>> {
    const where: Prisma.FavoriteWhereInput = { userId };
    const [total, rows] = await Promise.all([
      this.prisma.favorite.count({ where }),
      this.prisma.favorite.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          outfit: {
            include: {
              user: { select: { id: true, nickname: true, avatar: true } },
            },
          },
        },
      }),
    ]);

    return {
      list: rows.map((r) => ({
        id: r.id,
        outfitId: r.outfitId,
        createdAt: r.createdAt,
        outfit: this.toOutfitVo(r.outfit) as FavoriteItemVo['outfit'],
      })),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  // ---------------- 关注 ----------------

  /** 关注（幂等）：禁止关注自己，upsert 保证重复关注不产生多条 */
  async follow(userId: string, targetId: string): Promise<FollowToggleVo> {
    if (userId === targetId) {
      throw new BadRequestException('不能关注自己');
    }
    await this.requireUser(targetId);
    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId: userId, followingId: targetId },
      },
      create: { followerId: userId, followingId: targetId },
      update: {},
    });
    return { following: true };
  }

  /** 取消关注（幂等） */
  async unfollow(userId: string, targetId: string): Promise<FollowToggleVo> {
    await this.requireUser(targetId);
    await this.prisma.follow.deleteMany({
      where: { followerId: userId, followingId: targetId },
    });
    return { following: false };
  }

  /** 查询当前用户与目标用户的关系：是否关注 + 粉丝数/关注数 */
  async relationStatus(
    userId: string,
    targetId: string,
  ): Promise<RelationStatusVo> {
    await this.requireUser(targetId);
    const [follow, followerCount, followingCount] = await Promise.all([
      this.prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: userId, followingId: targetId },
        },
      }),
      this.prisma.follow.count({ where: { followingId: targetId } }),
      this.prisma.follow.count({ where: { followerId: targetId } }),
    ]);
    return { following: !!follow, followerCount, followingCount };
  }

  /** 目标用户的粉丝列表（分页，按关注时间倒序） */
  async listFollowers(
    targetId: string,
    q: QueryInteractionDto,
  ): Promise<PaginatedResult<UserBriefVo>> {
    await this.requireUser(targetId);
    const where: Prisma.FollowWhereInput = { followingId: targetId };
    const [total, rows] = await Promise.all([
      this.prisma.follow.count({ where }),
      this.prisma.follow.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: { id: true, nickname: true, avatar: true, signature: true },
          },
        },
      }),
    ]);
    return {
      list: rows.map((r) => r.follower),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 目标用户的关注列表（分页，按关注时间倒序） */
  async listFollowing(
    targetId: string,
    q: QueryInteractionDto,
  ): Promise<PaginatedResult<UserBriefVo>> {
    await this.requireUser(targetId);
    const where: Prisma.FollowWhereInput = { followerId: targetId };
    const [total, rows] = await Promise.all([
      this.prisma.follow.count({ where }),
      this.prisma.follow.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: { id: true, nickname: true, avatar: true, signature: true },
          },
        },
      }),
    ]);
    return {
      list: rows.map((r) => r.following),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  // ---------------- 内部工具 ----------------

  /** 校验穿搭存在，否则 404 */
  private async requireOutfit(outfitId: string): Promise<void> {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: outfitId },
      select: { id: true },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }
  }

  /** 校验用户存在，否则 404 */
  private async requireUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
  }

  /** Prisma 穿搭实体转对外视图：tags 由 JSON 文本解析为数组 */
  private toOutfitVo(o: Prisma.OutfitGetPayload<{
    include: { user: { select: { id: true; nickname: true; avatar: true } } };
  }>): OutfitVo & {
    user: { id: string; nickname: string; avatar: string | null };
  } {
    return {
      ...o,
      tags: parseArray<string>(o.tags),
    } as OutfitVo & {
      user: { id: string; nickname: string; avatar: string | null };
    };
  }
}
