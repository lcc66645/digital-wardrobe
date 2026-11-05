import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Feedback, Prisma } from '@prisma/client';
import type {
  Feedback as FeedbackVo,
  FeedbackHandleStatus,
  FeedbackType,
  PaginatedResult,
} from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /** 提交反馈：新建后置为待处理，归属当前用户 */
  async create(
    userId: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackVo> {
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('反馈内容不能为空');
    }

    const entity = await this.prisma.feedback.create({
      data: {
        userId,
        type: dto.type,
        content,
        handleStatus: 'PENDING',
        // 可选字段：trim 后为空串则落 null，避免存入无意义空白
        screenshot: dto.screenshot?.trim() || null,
        contact: dto.contact?.trim() || null,
      },
    });
    return this.toVo(entity);
  }

  /** 我的反馈列表（分页，按类型/处理状态过滤，按创建时间倒序） */
  async list(
    userId: string,
    q: QueryFeedbackDto,
  ): Promise<PaginatedResult<FeedbackVo>> {
    const where: Prisma.FeedbackWhereInput = {
      userId,
      ...(q.type ? { type: q.type } : {}),
      ...(q.handleStatus ? { handleStatus: q.handleStatus } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.findMany({
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

  /** 反馈详情：仅能查看本人提交的反馈 */
  async detail(userId: string, id: string): Promise<FeedbackVo> {
    const entity = await this.requireOwned(userId, id);
    return this.toVo(entity);
  }

  // ---------------- 内部工具 ----------------

  /** 校验反馈存在且归属当前用户，否则 404 */
  private async requireOwned(userId: string, id: string): Promise<Feedback> {
    const entity = await this.prisma.feedback.findFirst({
      where: { id, userId },
    });
    if (!entity) {
      throw new NotFoundException('反馈不存在');
    }
    return entity;
  }

  /** Prisma 实体转对外视图：SQLite 以字符串存枚举，统一断言为枚举类型 */
  private toVo(f: Feedback): FeedbackVo {
    return {
      ...f,
      type: f.type as FeedbackType,
      handleStatus: f.handleStatus as FeedbackHandleStatus,
    };
  }
}
