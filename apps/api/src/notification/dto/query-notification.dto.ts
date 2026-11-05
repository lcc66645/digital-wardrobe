import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@dw/shared';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 通知分页 + 筛选参数：按类型、已读状态过滤 */
export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按通知类型筛选', enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType, { message: '通知类型取值不合法' })
  type?: NotificationType;

  @ApiPropertyOptional({
    description: '按已读状态过滤：true 已读 / false 未读',
    example: false,
  })
  @IsOptional()
  // 全局 ValidationPipe 开启了 enableImplicitConversion，会先对 Boolean 做 Boolean(value)，
  // 导致字符串 "false" 被转成 true。这里显式 @Type(String) 保留原始字符串，
  // 再由 @Transform 精确解析；非法值原样返回，交给 @IsBoolean 拒绝。
  @Type(() => String)
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isRead 必须为 true 或 false' })
  isRead?: boolean;
}
