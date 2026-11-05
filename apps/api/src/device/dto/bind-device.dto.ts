import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** 设备绑定入参：通过硬件序列号 SN 配对 */
export class BindDeviceDto {
  @ApiProperty({
    description: '硬件序列号 SN，4–50 字符，服务端去除首尾空格',
    example: 'DW-2026-0001',
  })
  @IsString({ message: '设备 SN 必须为字符串' })
  @MinLength(4, { message: '设备 SN 至少 4 个字符' })
  @MaxLength(50, { message: '设备 SN 最多 50 个字符' })
  sn!: string;
}
