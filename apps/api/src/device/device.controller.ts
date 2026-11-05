import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Device } from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { DeviceService } from './device.service';
import { BindDeviceDto } from './dto/bind-device.dto';
import { ReportDeviceDto } from './dto/report-device.dto';

@ApiTags('device')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('devices/bind')
  @ApiOperation({ summary: '绑定设备（按 SN 配对，幂等）' })
  bind(
    @CurrentUser() current: RequestUser,
    @Body() dto: BindDeviceDto,
  ): Promise<Device> {
    return this.deviceService.bind(current.userId, dto);
  }

  // 注意：静态路由 me 必须声明在参数路由 :id 之前，否则会被当作 id 匹配
  @Get('devices/me')
  @ApiOperation({ summary: '我绑定的设备列表' })
  listMine(@CurrentUser() current: RequestUser): Promise<Device[]> {
    return this.deviceService.listMine(current.userId);
  }

  @Get('devices/:id')
  @ApiOperation({ summary: '设备详情（校验归属）' })
  detail(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<Device> {
    return this.deviceService.detail(current.userId, id);
  }

  @Patch('devices/:id/report')
  @ApiOperation({ summary: '设备状态上报（电量/固件/在线状态）' })
  report(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
    @Body() dto: ReportDeviceDto,
  ): Promise<Device> {
    return this.deviceService.report(current.userId, id, dto);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: '解绑设备（userId 置空、置为离线）' })
  unbind(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<Device> {
    return this.deviceService.unbind(current.userId, id);
  }
}
