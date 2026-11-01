import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_SALT_ROUNDS = 10;

/** 不向客户端暴露密码哈希的用户结构 */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface AuthResult {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** 手机号注册：查重、哈希密码、创建用户并签发 token */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('该手机号已注册');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const nickname = dto.nickname?.trim() || `衣橱用户${dto.phone.slice(-4)}`;

    const user = await this.prisma.user.create({
      data: { phone: dto.phone, passwordHash, nickname },
    });
    return this.buildAuthResult(user);
  }

  /** 手机号密码登录：校验用户、密码与封禁状态 */
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (user.status === 'BANNED') {
      throw new ForbiddenException('账号已被封禁，无法登录');
    }
    return this.buildAuthResult(user);
  }

  /** 按 id 获取当前登录用户资料（剥离密码哈希） */
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在或登录已失效');
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /** 签发 token 并剥离 passwordHash */
  private async buildAuthResult(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, phone: user.phone ?? '' };
    const accessToken = await this.jwtService.signAsync(payload);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }
}
