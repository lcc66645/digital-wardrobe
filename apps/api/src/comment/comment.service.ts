import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Comment as PrismaComment, Prisma } from '@prisma/client';
import type { PaginatedResult } from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { containsSensitive } from '../common/utils/sensitive.util';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

/** 评论作者简要信息 */
export interface CommentAuthorVo {
  id: string;
  nickname: string;
  avatar: string | null;
}

/** 评论视图：基础字段 + 作者信息，楼层由 parentId 表达 */
export interface CommentVo {
  id: string;
  outfitId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likeCount: number;
  createdAt: Date;
  user: CommentAuthorVo;
}

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  /** 发表评论/回复：校验穿搭可评论、敏感词、父评论归属后，在事务内创建并累加 commentCount */
  async create(
    userId: string,
    outfitId: string,
    dto: CreateCommentDto,
  ): Promise<CommentVo> {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: outfitId },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }
    if (!outfit.isPublished || outfit.auditStatus !== 'APPROVED') {
      throw new BadRequestException('该穿搭未公开发布或未通过审核，无法评论');
    }
    if (containsSensitive(dto.content)) {
      throw new BadRequestException('评论内容包含敏感词，请修改后再发布');
    }

    const data: Prisma.CommentCreateInput = {
      content: dto.content,
      outfit: { connect: { id: outfitId } },
      user: { connect: { id: userId } },
    };

    if (dto.parentId !== undefined) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, outfitId },
      });
      if (!parent) {
        throw new BadRequestException('父评论不存在或不属于该穿搭');
      }
      data.parent = { connect: { id: parent.id } };
    }

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data,
        include: { user: true },
      });
      await tx.outfit.update({
        where: { id: outfitId },
        data: { commentCount: { increment: 1 } },
      });
      return this.toVo(comment);
    });
  }

  /** 分页查询某穿搭的评论（含作者信息），支持最新/最热排序 */
  async findAll(
    outfitId: string,
    q: QueryCommentDto,
  ): Promise<PaginatedResult<CommentVo>> {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id: outfitId },
    });
    if (!outfit) {
      throw new NotFoundException('穿搭不存在');
    }

    const where: Prisma.CommentWhereInput = { outfitId };
    // 多字段排序须用数组：hot 先按点赞数、再按时间；latest 仅按时间
    const orderBy: Prisma.CommentOrderByWithRelationInput[] =
      q.sort === 'hot'
        ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    const [total, rows] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        skip: q.skip,
        take: q.pageSize,
        orderBy,
        include: { user: true },
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

  /** 删除评论：仅作者本人可删，事务内删除并递减 commentCount；子评论 parentId 由 schema 置空 */
  async remove(userId: string, commentId: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('只能删除自己的评论');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.delete({ where: { id: commentId } });
      await tx.outfit.update({
        where: { id: comment.outfitId },
        data: { commentCount: { decrement: 1 } },
      });
    });
  }

  /** Prisma 评论实体（含 user）转对外视图，仅暴露作者必要字段 */
  private toVo(
    c: PrismaComment & { user: { id: string; nickname: string; avatar: string | null } },
  ): CommentVo {
    return {
      id: c.id,
      outfitId: c.outfitId,
      userId: c.userId,
      content: c.content,
      parentId: c.parentId,
      likeCount: c.likeCount,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        nickname: c.user.nickname,
        avatar: c.user.avatar,
      },
    };
  }
}
