import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** 发表评论/回复入参：内容必填且去空格后非空，parentId 用于二级回复 */
export class CreateCommentDto {
  @ApiProperty({ description: '评论内容，1–200 字，首尾空格自动去除', example: '这套搭配好温柔呀' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: '评论内容必须是字符串' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @MaxLength(200, { message: '评论内容最多 200 个字' })
  content!: string;

  @ApiPropertyOptional({
    description: '父评论 ID；不传表示顶级评论，传入时须属于同一穿搭',
    example: 'cmxxx1',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
