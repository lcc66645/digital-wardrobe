import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@dw/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 管理端用户分页 + 筛选查询参数 */
export class QueryAdminUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按账号状态筛选', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, { message: '状态取值不合法' })
  status?: UserStatus;

  @ApiPropertyOptional({ description: '关键词：匹配昵称/手机号', example: '林' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  keyword?: string;
}
