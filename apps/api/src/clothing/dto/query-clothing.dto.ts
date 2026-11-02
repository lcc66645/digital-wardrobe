import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ClothingCategory,
  ClothingStatus,
  Occasion,
  Season,
} from '@dw/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 衣物分页+筛选查询参数 */
export class QueryClothingDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按品类筛选', enum: ClothingCategory })
  @IsOptional()
  @IsEnum(ClothingCategory, { message: '品类取值不合法' })
  category?: ClothingCategory;

  @ApiPropertyOptional({ description: '按生命周期状态筛选', enum: ClothingStatus })
  @IsOptional()
  @IsEnum(ClothingStatus, { message: '状态取值不合法' })
  status?: ClothingStatus;

  @ApiPropertyOptional({ description: '按场合筛选', enum: Occasion })
  @IsOptional()
  @IsEnum(Occasion, { message: '场合取值不合法' })
  occasion?: Occasion;

  @ApiPropertyOptional({ description: '按单个季节筛选', enum: Season })
  @IsOptional()
  @IsEnum(Season, { message: '季节取值不合法' })
  season?: Season;

  @ApiPropertyOptional({ description: '关键词：匹配名称/颜色/标签', example: '针织' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
