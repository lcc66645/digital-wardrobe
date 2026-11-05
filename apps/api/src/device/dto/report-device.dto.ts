import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceOnlineStatus } from '@dw/shared';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** 设备状态上报入参：全部可选，仅更新传入字段；上报即刷新最后在线时间 */
export class ReportDeviceDto {
  @ApiPropertyOptional({ description: '电量百分比，0–100 的整数', example: 86 })
  @IsOptional()
  @IsInt({ message: '电量必须为整数' })
  @Min(0, { message: '电量不能小于 0' })
  @Max(100, { message: '电量不能大于 100' })
  battery?: number;

  @ApiPropertyOptional({ description: '固件版本号', example: '1.2.0' })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: '固件版本号最多 30 个字符' })
  firmwareVersion?: string;

  @ApiPropertyOptional({
    description: '在线状态',
    enum: DeviceOnlineStatus,
    example: DeviceOnlineStatus.ONLINE,
  })
  @IsOptional()
  @IsEnum(DeviceOnlineStatus, { message: '在线状态取值不合法' })
  onlineStatus?: DeviceOnlineStatus;
}
