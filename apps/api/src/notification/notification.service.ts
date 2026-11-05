import { Injectable, NotFoundException } from '@nestjs/common';
import type { Notification, Prisma } from '@prisma/client';
import type {
  Notification as NotificationVo,
  NotificationType,
  PaginatedResult,
} from '@dw/shared';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

/** 未读数结果 */
export interface UnreadCountVo {
  count: number;
}

/** 全部已读结果：实际被置为已读的条数 */
export interface MarkAllReadVo {
  updated: number;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /** 通知列表（分页，按类型/已读状态过滤，按创建时间倒序） */
  async list(
    userId: string,
    q: QueryNotificationDto,
  ): Promise<PaginatedResult<NotificationVo>> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(q.type ? { type: q.type } : {}),
      ...(q.isRead !== undefined ? { isRead: q.isRead } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
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

  /** 未读通知数 */
  async unreadCount(userId: string): Promise<UnreadCountVo> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /** 单条标记已读（幂等：已读则直接返回，校验归属） */
  async markRead(userId: string, id: string): Promise<NotificationVo> {
    const note = await this.requireOwned(userId, id);
    if (note.isRead) {
      return this.toVo(note);
    }
    const updated = await this.prisma.notification.update({
      where: { id: note.id },
      data: { isRead: true },
    });
    return this.toVo(updated);
  }

  /** 全部已读：仅更新当前用户的未读项，返回实际更新条数 */
  async markAllRead(userId: string): Promise<MarkAllReadVo> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  // ---------------- 内部工具 ----------------

  /** 校验通知存在且归属当前用户，否则 404 */
  private async requireOwned(userId: string, id: string): Promise<Notification> {
    const note = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!note) {
      throw new NotFoundException('通知不存在');
    }
    return note;
  }

  /** Prisma 实体转对外视图：SQLite 以字符串存枚举，统一断言为枚举类型 */
  private toVo(n: Notification): NotificationVo {
    return {
      ...n,
      type: n.type as NotificationType,
    };
  }
}
