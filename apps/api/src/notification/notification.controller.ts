import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  Notification as NotificationVo,
  PaginatedResult,
} from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import {
  MarkAllReadVo,
  NotificationService,
  UnreadCountVo,
} from './notification.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

@ApiTags('notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  @ApiOperation({ summary: '通知列表（分页，按类型/已读状态过滤）' })
  list(
    @CurrentUser() current: RequestUser,
    @Query() query: QueryNotificationDto,
  ): Promise<PaginatedResult<NotificationVo>> {
    return this.notificationService.list(current.userId, query);
  }

  // 静态路由统一声明在参数路由之前，避免被当作 id 匹配
  @Get('notifications/unread-count')
  @ApiOperation({ summary: '未读通知数' })
  unreadCount(@CurrentUser() current: RequestUser): Promise<UnreadCountVo> {
    return this.notificationService.unreadCount(current.userId);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: '全部标记已读（返回实际更新条数）' })
  markAllRead(@CurrentUser() current: RequestUser): Promise<MarkAllReadVo> {
    return this.notificationService.markAllRead(current.userId);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: '单条标记已读（幂等）' })
  markRead(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<NotificationVo> {
    return this.notificationService.markRead(current.userId, id);
  }
}
