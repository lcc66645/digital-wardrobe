import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@dw/shared';
import { IsEnum } from 'class-validator';

/** 管理端修改用户状态请求体（封禁/解封） */
export class UpdateUserStatusDto {
  @ApiProperty({ description: '目标状态：ACTIVE 正常 / BANNED 封禁', enum: UserStatus })
  @IsEnum(UserStatus, { message: '状态取值不合法' })
  status!: UserStatus;
}
