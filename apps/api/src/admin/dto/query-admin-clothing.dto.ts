import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClothingCategory, ClothingStatus } from '@dw/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 管理端衣物分页 + 筛选查询参数（跨用户） */
export class QueryAdminClothingDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按品类筛选', enum: ClothingCategory })
  @IsOptional()
  @IsEnum(ClothingCategory, { message: '品类取值不合法' })
  category?: ClothingCategory;

  @ApiPropertyOptional({ description: '按生命周期状态筛选', enum: ClothingStatus })
  @IsOptional()
  @IsEnum(ClothingStatus, { message: '状态取值不合法' })
  status?: ClothingStatus;

  @ApiPropertyOptional({ description: '按所属用户 ID 筛选' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '关键词：匹配名称/颜色', example: '牛仔' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
