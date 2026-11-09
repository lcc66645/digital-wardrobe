import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditStatus } from '@dw/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 管理端穿搭分页 + 筛选查询参数（跨用户） */
export class QueryAdminOutfitDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按审核状态筛选', enum: AuditStatus })
  @IsOptional()
  @IsEnum(AuditStatus, { message: '审核状态取值不合法' })
  auditStatus?: AuditStatus;

  @ApiPropertyOptional({ description: '按作者用户 ID 筛选' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '关键词：匹配穿搭文案', example: '通勤' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
