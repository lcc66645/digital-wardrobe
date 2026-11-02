import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Mood } from '@dw/shared';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** 新增穿搭入参：日期、关联单品必填；tags 落库时序列化为 JSON 文本 */
export class CreateOutfitDto {
  @ApiProperty({ description: '穿搭日期（ISO 8601）', example: '2026-11-02' })
  @IsDateString({}, { message: '日期格式不正确' })
  date!: string;

  @ApiPropertyOptional({ description: '当日心情', enum: Mood, example: Mood.HAPPY })
  @IsOptional()
  @IsEnum(Mood, { message: '心情取值不合法' })
  mood?: Mood;

  @ApiPropertyOptional({ description: '穿搭图片 URL', example: 'https://cdn.example.com/o.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '穿搭文案，最多 200 字', example: '今天是温柔的奶油色系' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '穿搭文案最多 200 个字' })
  content?: string;

  @ApiPropertyOptional({ description: '标签，最多 10 个、每个 10 字', isArray: true, example: ['通勤', '奶油色'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: '标签最多 10 个' })
  @IsString({ each: true })
  @MaxLength(10, { each: true, message: '单个标签最多 10 个字' })
  tags?: string[];

  @ApiProperty({
    description: '关联的衣物 ID 列表，至少 1 件且必须属于当前用户',
    isArray: true,
    example: ['clxxx1', 'clxxx2'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '至少关联 1 件衣物' })
  @ArrayMaxSize(20, { message: '一套穿搭最多关联 20 件衣物' })
  @IsString({ each: true })
  items!: string[];

  @ApiPropertyOptional({ description: '是否立即发布；发布后进入待审核，不可自审通过', default: false, example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
