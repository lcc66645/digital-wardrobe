import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Outfit as PrismaOutfit, Prisma } from '@prisma/client';
import type {
  Clothing as ClothingVo,
  Outfit as OutfitVo,
  PaginatedResult,
} from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parseArray, stringifyArray } from '../common/utils/json-field.util';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { QueryOutfitDto } from './dto/query-outfit.dto';

/** 单品明细视图：关联键 + 衣物关键信息 */
export interface OutfitItemVo {
  id: string;
  outfitId: string;
  clothingId: string;
  clothing: Pick<
    ClothingVo,
    'id' | 'name' | 'category' | 'color' | 'imageUrl' | 'status'
  >;
}

/** 穿搭详情视图：基础字段 + 单品明细 */
export interface OutfitDetailVo extends OutfitVo {
  items: OutfitItemVo[];
}

@Injectable()
export class OutfitService {
  constructor(private readonly prisma: PrismaService) {}

  /** 新增穿搭：校验单品归属后在事务内创建 Outfit 与 OutfitItem */
  async create(userId: string, dto: CreateOutfitDto): Promise<OutfitDetailVo> {
    const data: Prisma.OutfitCreateInput = {
      user: { connect: { id: userId } },
      date: new Date(dto.date),
      tags: stringifyArray(dto.tags?.map((t) => t.trim())),
      isPublished: dto.isPublished ?? false,
      // 用户无法自审通过：无论是否发布，auditStatus 一律从 PENDING 起，发布后由后台审核
      auditStatus: 'PENDING',
    };
    if (dto.mood !== undefined) data.mood = dto.mood;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim();
    if (dto.content !== undefined) data.content = dto.content.trim();

    return this.prisma.$transaction(async (tx) => {
      const validIds = await this.validateItems(tx, userId, dto.items);
      const outfit = await tx.outfit.create({ data });
      await tx.outfitItem.createMany({
        data: validIds.map((clothingId) => ({ outfitId: outfit.id, clothingId })),
      });
      return this.buildDetail(tx, outfit.id);
    });
  }

  /** 分页查询我的穿搭，支持心情/审核状态/发布状态/日期范围/关键词筛选 */
  async findAll(
    userId: string,
    q: QueryOutfitDto,
  ): Promise<PaginatedResult<OutfitVo>> {
    const where: Prisma.OutfitWhereInput = { userId };
    if (q.mood) where.mood = q.mood;
    if (q.auditStatus) where.auditStatus = q.auditStatus;
    if (q.isPublished !== undefined) where.isPublished = q.isPublished;
    if (q.startDate || q.endDate) {
      const dateCond: Prisma.DateTimeFilter = {};
      if (q.startDate) dateCond.gte = new Date(q.startDate);
      if (q.endDate) dateCond.lte = new Date(q.endDate);
      where.date = dateCond;
    }
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.OR = [{ content: { contains: kw } }, { tags: { contains: kw } }];
    }

    const [total, rows] = await Promise.all([
      this.prisma.outfit.count({ where }),
      this.prisma.outfit.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      list: rows.map((r) => this.toVo(r)),
      total,
      page: q.page,
      pageSize: q.pageSize,
      totalPages: Math.ceil(total / q.pageSize),
    };
  }

  /** 查询穿搭详情（校验归属，含单品明细） */
  async findOne(userId: string, id: string): Promise<OutfitDetailVo> {
    await this.getOwned(userId, id);
    return this.buildDetail(this.prisma, id);
  }

  /** 更新穿搭（校验归属）；传入 items 时重新关联，发布时重置为待审核 */
  async update(
    userId: string,
    id: string,
    dto: UpdateOutfitDto,
  ): Promise<OutfitDetailVo> {
    await this.getOwned(userId, id);
    const data: Prisma.OutfitUpdateInput = {};
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.mood !== undefined) data.mood = dto.mood;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim();
    if (dto.content !== undefined) data.content = dto.content.trim();
    if (dto.tags !== undefined)
      data.tags = stringifyArray(dto.tags.map((t) => t.trim()));
    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
      // 重新发布需再次走审核，禁止用户自行把状态置为通过
      if (dto.isPublished) data.auditStatus = 'PENDING';
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.items !== undefined) {
        const validIds = await this.validateItems(tx, userId, dto.items);
        await tx.outfitItem.deleteMany({ where: { outfitId: id } });
        await tx.outfitItem.createMany({
          data: validIds.map((clothingId) => ({ outfitId: id, clothingId })),
        });
      }
      await tx.outfit.update({ where: { id }, data });
      return this.buildDetail(tx, id);
    });
  }

  /** 删除穿搭（校验归属）；OutfitItem 由 schema onDelete Cascade 自动清理 */
  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.outfit.delete({ where: { id } });
  }

  /** 校验穿搭存在且归属于当前用户，否则统一 404 */
  private async getOwned(userId: string, id: string): Promise<PrismaOutfit> {
    const outfit = await this.prisma.outfit.findFirst({
      where: { id, userId },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }
    return outfit;
  }

  /**
   * 校验关联单品：去重、去空，并确认全部属于当前用户。
   * 任一 ID 不存在或不属于该用户即 400，防止关联他人衣物。
   */
  private async validateItems(
    client: Prisma.TransactionClient,
    userId: string,
    clothingIds: string[],
  ): Promise<string[]> {
    const ids = [
      ...new Set(clothingIds.map((c) => c.trim()).filter(Boolean)),
    ];
    if (ids.length === 0) {
      throw new BadRequestException('至少关联 1 件衣物');
    }
    const owned = await client.clothing.findMany({
      where: { userId, id: { in: ids } },
      select: { id: true },
    });
    if (owned.length !== ids.length) {
      throw new BadRequestException('包含不属于你的衣物或衣物不存在');
    }
    return ids;
  }

  /** 组装详情：Outfit + 单品（含衣物关键信息） */
  private async buildDetail(
    client: Prisma.TransactionClient,
    outfitId: string,
  ): Promise<OutfitDetailVo> {
    const outfit = await client.outfit.findUnique({
      where: { id: outfitId },
      include: {
        items: { include: { clothing: true }, orderBy: { id: 'asc' } },
      },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }
    const { items, ...base } = outfit;
    const detail = {
      ...this.toVo(base),
      items: items.map((it) => ({
        id: it.id,
        outfitId: it.outfitId,
        clothingId: it.clothingId,
        clothing: {
          id: it.clothing.id,
          name: it.clothing.name,
          category: it.clothing.category,
          color: it.clothing.color,
          imageUrl: it.clothing.imageUrl,
          status: it.clothing.status,
        },
      })),
    };
    // Prisma 枚举字段以 String 存储，写入时已校验，整体断言为对外详情类型
    return detail as OutfitDetailVo;
  }

  /** Prisma 实体转对外视图：tags 由 JSON 文本解析为数组 */
  private toVo(o: PrismaOutfit): OutfitVo {
    return {
      ...o,
      tags: parseArray<string>(o.tags),
    } as OutfitVo;
  }
}
