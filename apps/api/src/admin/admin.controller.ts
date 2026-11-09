import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminClothingVo,
  AdminCommentVo,
  AdminDeviceVo,
  AdminOutfitVo,
  DashboardVo,
  PaginatedResult,
} from '@dw/shared';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AuditOutfitDto } from './dto/audit-outfit.dto';
import { QueryAdminClothingDto } from './dto/query-admin-clothing.dto';
import { QueryAdminDeviceDto } from './dto/query-admin-device.dto';
import { UpdateClothingStatusDto } from './dto/update-clothing-status.dto';
import { QueryAdminOutfitDto } from './dto/query-admin-outfit.dto';
import { QueryAdminUserDto } from './dto/query-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

type AdminSafeUser = Omit<User, 'passwordHash'>;

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '管理后台-数据看板聚合（总览/趋势/分布）' })
  getDashboard(): Promise<DashboardVo> {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: '管理后台-用户分页列表（状态/关键词过滤）' })
  listUsers(
    @Query() query: QueryAdminUserDto,
  ): Promise<PaginatedResult<AdminSafeUser>> {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: '管理后台-封禁/解封用户（切换状态）' })
  setUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() current: RequestUser,
  ): Promise<AdminSafeUser> {
    return this.adminService.setUserStatus(id, dto, current.userId);
  }

  @Get('clothing')
  @ApiOperation({ summary: '管理后台-衣物分页列表（品类/状态/用户/关键词过滤）' })
  listClothing(
    @Query() query: QueryAdminClothingDto,
  ): Promise<PaginatedResult<AdminClothingVo>> {
    return this.adminService.listClothing(query);
  }

  @Patch('clothing/:id/status')
  @ApiOperation({ summary: '管理后台-调整衣物生命周期状态' })
  setClothingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateClothingStatusDto,
  ): Promise<AdminClothingVo> {
    return this.adminService.setClothingStatus(id, dto);
  }

  @Get('outfits')
  @ApiOperation({ summary: '管理后台-穿搭分页列表（审核状态/作者/关键词过滤）' })
  listOutfits(
    @Query() query: QueryAdminOutfitDto,
  ): Promise<PaginatedResult<AdminOutfitVo>> {
    return this.adminService.listOutfits(query);
  }

  @Patch('outfits/:id/audit')
  @ApiOperation({ summary: '管理后台-穿搭审核（通过/驳回）' })
  auditOutfit(
    @Param('id') id: string,
    @Body() dto: AuditOutfitDto,
  ): Promise<AdminOutfitVo> {
    return this.adminService.auditOutfit(id, dto);
  }

  @Get('outfits/:id/comments')
  @ApiOperation({ summary: '管理后台-查看某条穿搭的评论列表' })
  listOutfitComments(@Param('id') id: string): Promise<AdminCommentVo[]> {
    return this.adminService.listOutfitComments(id);
  }

  @Get('devices')
  @ApiOperation({ summary: '管理后台-设备分页列表（在线状态/用户/关键词过滤）' })
  listDevices(
    @Query() query: QueryAdminDeviceDto,
  ): Promise<PaginatedResult<AdminDeviceVo>> {
    return this.adminService.listDevices(query);
  }

  @Delete('devices/:id/binding')
  @ApiOperation({ summary: '管理后台-强制解绑设备（解除与用户的绑定关系）' })
  unbindDevice(@Param('id') id: string): Promise<AdminDeviceVo> {
    return this.adminService.unbindDevice(id);
  }
}
