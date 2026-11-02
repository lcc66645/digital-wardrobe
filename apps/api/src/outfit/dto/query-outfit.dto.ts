import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditStatus, Mood } from '@dw/shared';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 穿搭分页+筛选查询参数 */
export class QueryOutfitDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按心情筛选', enum: Mood })
  @IsOptional()
  @IsEnum(Mood, { message: '心情取值不合法' })
  mood?: Mood;

  @ApiPropertyOptional({ description: '按审核状态筛选', enum: AuditStatus })
  @IsOptional()
  @IsEnum(AuditStatus, { message: '审核状态取值不合法' })
  auditStatus?: AuditStatus;

  @ApiPropertyOptional({ description: '是否已发布', example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: '起始日期（含，ISO 8601）', example: '2026-11-01' })
  @IsOptional()
  @IsDateString({}, { message: '起始日期格式不正确' })
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期（含，ISO 8601）', example: '2026-11-30' })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  @ApiPropertyOptional({ description: '关键词：匹配文案/标签', example: '通勤' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
