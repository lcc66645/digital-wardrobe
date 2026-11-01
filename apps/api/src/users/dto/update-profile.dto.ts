import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@dw/shared';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * 用户资料更新入参（PATCH 语义，全部可选，仅更新传入字段）。
 * 字段口径对齐 PRD：身高 100–220 整数、性别枚举、签名 0–50 字。
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称，1–20 字', example: '小衣橱' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '昵称至少 1 个字' })
  @MaxLength(20, { message: '昵称最多 20 个字' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像图片 URL', example: 'https://cdn.example.com/a.png' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: '性别：MALE/FEMALE/UNKNOWN',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: '性别取值不合法' })
  gender?: Gender;

  @ApiPropertyOptional({ description: '个性签名，0–50 字', example: '今天也要好好穿衣服' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '个性签名最多 50 个字' })
  signature?: string;

  @ApiPropertyOptional({ description: '所在城市', example: '杭州' })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: '城市名称最多 30 个字' })
  city?: string;

  @ApiPropertyOptional({ description: '身高（cm），100–220 整数', example: 168 })
  @IsOptional()
  @IsInt({ message: '身高必须为整数' })
  @Min(100, { message: '身高不能低于 100cm' })
  @Max(220, { message: '身高不能高于 220cm' })
  height?: number;

  @ApiPropertyOptional({ description: '穿搭风格', example: '温柔风' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '穿搭风格最多 20 个字' })
  style?: string;
}
