import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  Feedback as FeedbackVo,
  PaginatedResult,
} from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedback')
  @ApiOperation({ summary: '提交意见反馈（新建后置为待处理）' })
  create(
    @CurrentUser() current: RequestUser,
    @Body() dto: CreateFeedbackDto,
  ): Promise<FeedbackVo> {
    return this.feedbackService.create(current.userId, dto);
  }

  @Get('feedback')
  @ApiOperation({ summary: '我的反馈列表（分页，按类型/处理状态过滤）' })
  list(
    @CurrentUser() current: RequestUser,
    @Query() query: QueryFeedbackDto,
  ): Promise<PaginatedResult<FeedbackVo>> {
    return this.feedbackService.list(current.userId, query);
  }

  @Get('feedback/:id')
  @ApiOperation({ summary: '反馈详情（仅本人）' })
  detail(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<FeedbackVo> {
    return this.feedbackService.detail(current.userId, id);
  }
}
