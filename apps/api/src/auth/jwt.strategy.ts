import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

/** JWT 载荷：sub 为用户 id，phone 为登录手机号 */
export interface JwtPayload {
  sub: string;
  phone: string;
}

/** 挂载到 request.user 的已认证用户信息 */
export interface RequestUser {
  userId: string;
  phone: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'dw-dev-secret',
    });
  }

  /** 每次受保护请求都校验用户仍存在且未被封禁，防止旧 token 越权访问 */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在或登录已失效');
    }
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('账号已被封禁');
    }
    return { userId: user.id, phone: user.phone ?? '' };
  }
}
