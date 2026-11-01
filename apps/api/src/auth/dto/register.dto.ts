import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** 手机号注册入参 */
export class RegisterDto {
  @ApiProperty({ description: '中国大陆手机号（11 位）', example: '13800138000' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ description: '登录密码，6–20 位', example: 'abc123456' })
  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  @MaxLength(20, { message: '密码最多 20 位' })
  password!: string;

  @ApiPropertyOptional({ description: '昵称，1–20 字；不传则系统自动生成', example: '小衣橱' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname?: string;
}
