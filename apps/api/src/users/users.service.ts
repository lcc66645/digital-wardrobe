import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** 不向客户端暴露密码哈希的用户结构 */
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 按 id 获取用户资料（剥离密码哈希） */
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return this.toSafeUser(user);
  }

  /** 按 id 更新用户资料，仅更新传入字段；字符串去除首尾空格 */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.nickname !== undefined) data.nickname = dto.nickname.trim();
    if (dto.avatar !== undefined) data.avatar = dto.avatar.trim();
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.signature !== undefined) data.signature = dto.signature.trim();
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.height !== undefined) data.height = dto.height;
    if (dto.style !== undefined) data.style = dto.style.trim();

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.toSafeUser(user);
  }

  /** 剥离密码哈希字段 */
  private toSafeUser(user: User): SafeUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
