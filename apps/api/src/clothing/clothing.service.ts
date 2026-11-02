import { Injectable, NotFoundException } from '@nestjs/common';
import type { Clothing as PrismaClothing, Prisma } from '@prisma/client';
import type { Clothing as ClothingVo, PaginatedResult, Season } from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { parseArray, stringifyArray } from '../common/utils/json-field.util';
import { CreateClothingDto } from './dto/create-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
import { QueryClothingDto } from './dto/query-clothing.dto';

@Injectable()
export class ClothingService {
  constructor(private readonly prisma: PrismaService) {}

  /** 新增衣物，seasons/tags 序列化为 JSON 文本存储 */
  async create(userId: string, dto: CreateClothingDto): Promise<ClothingVo> {
    const data: Prisma.ClothingCreateInput = {
      user: { connect: { id: userId } },
      name: dto.name.trim(),
      category: dto.category,
      seasons: stringifyArray(dto.seasons),
      tags: stringifyArray(dto.tags?.map((t) => t.trim())),
      status: dto.status ?? 'IN_USE',
    };
    if (dto.color !== undefined) data.color = dto.color.trim();
    if (dto.occasion !== undefined) data.occasion = dto.occasion;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim();
    if (dto.purchasePrice !== undefined) data.purchasePrice = dto.purchasePrice;

    return this.toVo(await this.prisma.clothing.create({ data }));
  }

  /** 分页查询当前用户衣物，支持分类/状态/场合/季节/关键词筛选 */
  async findAll(
    userId: string,
    q: QueryClothingDto,
  ): Promise<PaginatedResult<ClothingVo>> {
    const where: Prisma.ClothingWhereInput = { userId };
    if (q.category) where.category = q.category;
    if (q.status) where.status = q.status;
    if (q.occasion) where.occasion = q.occasion;
    // seasons 以 JSON 文本存储，按带引号的枚举值做包含匹配，避免子串误匹配
    if (q.season) where.seasons = { contains: `"${q.season}"` };
    if (q.keyword) {
      const kw = q.keyword.trim();
      where.OR = [
        { name: { contains: kw } },
        { color: { contains: kw } },
        { tags: { contains: kw } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.clothing.count({ where }),
      this.prisma.clothing.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy: { createdAt: 'desc' },
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

  /** 查询单件衣物（校验归属） */
  async findOne(userId: string, id: string): Promise<ClothingVo> {
    return this.toVo(await this.getOwned(userId, id));
  }

  /** 更新衣物（校验归属，仅更新传入字段） */
  async update(
    userId: string,
    id: string,
    dto: UpdateClothingDto,
  ): Promise<ClothingVo> {
    await this.getOwned(userId, id);
    const data: Prisma.ClothingUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.color !== undefined) data.color = dto.color.trim();
    if (dto.seasons !== undefined) data.seasons = stringifyArray(dto.seasons);
    if (dto.occasion !== undefined) data.occasion = dto.occasion;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl.trim();
    if (dto.purchasePrice !== undefined) data.purchasePrice = dto.purchasePrice;
    if (dto.tags !== undefined)
      data.tags = stringifyArray(dto.tags.map((t) => t.trim()));
    if (dto.status !== undefined) data.status = dto.status;

    return this.toVo(
      await this.prisma.clothing.update({ where: { id }, data }),
    );
  }

  /** 删除衣物（校验归属） */
  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.prisma.clothing.delete({ where: { id } });
  }

  /** 校验衣物存在且归属于当前用户，否则统一 404 */
  private async getOwned(
    userId: string,
    id: string,
  ): Promise<PrismaClothing> {
    const clothing = await this.prisma.clothing.findFirst({
      where: { id, userId },
    });
    if (!clothing) {
      throw new NotFoundException('衣物不存在');
    }
    return clothing;
  }

  /** Prisma 实体转对外视图：seasons/tags 由 JSON 文本解析为数组 */
  private toVo(c: PrismaClothing): ClothingVo {
    // Prisma 枚举字段以 String 存储，写入时已校验为合法枚举，这里统一断言为 shared 视图类型
    return {
      ...c,
      seasons: parseArray<Season>(c.seasons),
      tags: parseArray<string>(c.tags),
    } as ClothingVo;
  }
}
