import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Device as DeviceVo, DeviceOnlineStatus } from '@dw/shared';
import { DeviceOnlineStatus as OnlineStatus } from '@dw/shared';
import type { Device } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BindDeviceDto } from './dto/bind-device.dto';
import { ReportDeviceDto } from './dto/report-device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 绑定设备（幂等）：
   * - SN 不存在：首次配对即激活，创建并绑定当前用户；
   * - SN 已存在且空闲：绑定当前用户；
   * - 已绑定当前用户：幂等返回；
   * - 已被其他用户绑定：409 冲突。
   */
  async bind(userId: string, dto: BindDeviceDto): Promise<DeviceVo> {
    const sn = dto.sn.trim();
    const existing = await this.prisma.device.findUnique({ where: { sn } });

    if (!existing) {
      const created = await this.prisma.device.create({
        data: {
          sn,
          userId,
          onlineStatus: OnlineStatus.ONLINE,
          lastOnlineAt: new Date(),
        },
      });
      return this.toVo(created);
    }

    if (existing.userId === userId) {
      return this.toVo(existing);
    }
    if (existing.userId !== null) {
      throw new ConflictException('该设备已被其他账号绑定');
    }

    const bound = await this.prisma.device.update({
      where: { id: existing.id },
      data: {
        userId,
        onlineStatus: OnlineStatus.ONLINE,
        lastOnlineAt: new Date(),
      },
    });
    return this.toVo(bound);
  }

  /** 解绑设备：仅能解绑自己名下设备，解绑后 userId 置空、状态置为离线 */
  async unbind(userId: string, id: string): Promise<DeviceVo> {
    const device = await this.requireOwned(userId, id);
    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: { userId: null, onlineStatus: OnlineStatus.OFFLINE },
    });
    return this.toVo(updated);
  }

  /** 当前用户绑定的全部设备，按最后在线时间倒序 */
  async listMine(userId: string): Promise<DeviceVo[]> {
    const rows = await this.prisma.device.findMany({
      where: { userId },
      orderBy: [{ lastOnlineAt: 'desc' }, { sn: 'asc' }],
    });
    return rows.map((d) => this.toVo(d));
  }

  /** 设备详情（校验归属） */
  async detail(userId: string, id: string): Promise<DeviceVo> {
    return this.toVo(await this.requireOwned(userId, id));
  }

  /** 设备状态上报：仅更新传入字段，同时刷新最后在线时间（校验归属） */
  async report(
    userId: string,
    id: string,
    dto: ReportDeviceDto,
  ): Promise<DeviceVo> {
    await this.requireOwned(userId, id);
    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        ...(dto.battery !== undefined ? { battery: dto.battery } : {}),
        ...(dto.firmwareVersion !== undefined
          ? { firmwareVersion: dto.firmwareVersion }
          : {}),
        ...(dto.onlineStatus !== undefined
          ? { onlineStatus: dto.onlineStatus }
          : {}),
        lastOnlineAt: new Date(),
      },
    });
    return this.toVo(updated);
  }

  // ---------------- 内部工具 ----------------

  /** 校验设备存在且归当前用户所有，否则 404（不暴露设备是否存在给非属主） */
  private async requireOwned(userId: string, id: string): Promise<Device> {
    const device = await this.prisma.device.findFirst({
      where: { id, userId },
    });
    if (!device) {
      throw new NotFoundException('设备不存在或未绑定到当前账号');
    }
    return device;
  }

  /** Prisma 实体转对外视图：SQLite 以字符串存枚举，统一断言为枚举类型 */
  private toVo(d: Device): DeviceVo {
    return {
      ...d,
      onlineStatus: d.onlineStatus as DeviceOnlineStatus,
    };
  }
}
