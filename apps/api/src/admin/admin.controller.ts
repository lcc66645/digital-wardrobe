import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { DashboardVo, PaginatedResult } from '@dw/shared';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
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
}
