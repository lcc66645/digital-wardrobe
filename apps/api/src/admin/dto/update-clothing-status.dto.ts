import { ApiProperty } from '@nestjs/swagger';
import { ClothingStatus } from '@dw/shared';
import { IsEnum } from 'class-validator';

/** 管理端调整衣物生命周期状态的请求体 */
export class UpdateClothingStatusDto {
  @ApiProperty({ description: '目标生命周期状态', enum: ClothingStatus })
  @IsEnum(ClothingStatus, { message: '状态取值不合法' })
  status!: ClothingStatus;
}
