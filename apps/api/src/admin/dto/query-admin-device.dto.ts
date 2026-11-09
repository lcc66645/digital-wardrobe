import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceOnlineStatus } from '@dw/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 管理端设备分页 + 筛选查询参数（跨用户） */
export class QueryAdminDeviceDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按在线状态筛选', enum: DeviceOnlineStatus })
  @IsOptional()
  @IsEnum(DeviceOnlineStatus, { message: '在线状态取值不合法' })
  onlineStatus?: DeviceOnlineStatus;

  @ApiPropertyOptional({ description: '按绑定用户 ID 筛选' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '关键词：匹配设备 SN / 固件版本', example: 'DW-SEED' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
