import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService, type SafeUser } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前登录用户资料（需 JWT）' })
  getProfile(@CurrentUser() current: RequestUser): Promise<SafeUser> {
    return this.usersService.getProfile(current.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: '更新当前登录用户资料（需 JWT，仅更新传入字段）' })
  updateProfile(
    @CurrentUser() current: RequestUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    return this.usersService.updateProfile(current.userId, dto);
  }
}
