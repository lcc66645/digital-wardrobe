import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

/** 手机号密码登录入参 */
export class LoginDto {
  @ApiProperty({ description: '中国大陆手机号（11 位）', example: '13800138000' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @ApiProperty({ description: '登录密码', example: 'abc123456' })
  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password!: string;
}
