import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ClothingCategory,
  ClothingStatus,
  Occasion,
  Season,
} from '@dw/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** 新增衣物入参：名称、品类必填；seasons/tags 为数组，落库时序列化为 JSON 文本 */
export class CreateClothingDto {
  @ApiProperty({ description: '衣物名称，1–30 字', example: '米白针织开衫' })
  @IsString()
  @MinLength(1, { message: '衣物名称至少 1 个字' })
  @MaxLength(30, { message: '衣物名称最多 30 个字' })
  name!: string;

  @ApiProperty({ description: '衣物品类', enum: ClothingCategory, example: ClothingCategory.TOP })
  @IsEnum(ClothingCategory, { message: '衣物品类取值不合法' })
  category!: ClothingCategory;

  @ApiPropertyOptional({ description: '颜色', example: '米白' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({ description: '适用季节，可多选', enum: Season, isArray: true, example: [Season.SPRING, Season.AUTUMN] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, { message: '季节最多 4 个' })
  @IsEnum(Season, { each: true, message: '季节取值不合法' })
  seasons?: Season[];

  @ApiPropertyOptional({ description: '穿着场合', enum: Occasion, example: Occasion.WORK })
  @IsOptional()
  @IsEnum(Occasion, { message: '穿着场合取值不合法' })
  occasion?: Occasion;

  @ApiPropertyOptional({ description: '衣物图片 URL', example: 'https://cdn.example.com/c.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '购入价格（元），非负', example: 299 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '购入价格式不正确' })
  @Min(0, { message: '购入价不能为负' })
  purchasePrice?: number;

  @ApiPropertyOptional({ description: '自定义标签，最多 10 个、每个 10 字', isArray: true, example: ['百搭', '显瘦'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: '标签最多 10 个' })
  @IsString({ each: true })
  @MaxLength(10, { each: true, message: '单个标签最多 10 个字' })
  tags?: string[];

  @ApiPropertyOptional({ description: '生命周期状态，默认 IN_USE', enum: ClothingStatus, example: ClothingStatus.IN_USE })
  @IsOptional()
  @IsEnum(ClothingStatus, { message: '衣物状态取值不合法' })
  status?: ClothingStatus;
}
