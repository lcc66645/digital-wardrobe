import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackHandleStatus, FeedbackType } from '@dw/shared';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 我的反馈分页 + 筛选参数：按类型、处理状态过滤 */
export class QueryFeedbackDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按反馈类型筛选', enum: FeedbackType })
  @IsOptional()
  @IsEnum(FeedbackType, { message: '反馈类型取值不合法' })
  type?: FeedbackType;

  @ApiPropertyOptional({
    description: '按处理状态筛选：PENDING 待处理 / PROCESSING 处理中 / RESOLVED 已解决',
    enum: FeedbackHandleStatus,
  })
  @IsOptional()
  @IsEnum(FeedbackHandleStatus, { message: '处理状态取值不合法' })
  handleStatus?: FeedbackHandleStatus;
}
