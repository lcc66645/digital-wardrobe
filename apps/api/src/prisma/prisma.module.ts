import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** 全局 Prisma 模块，任意模块可直接注入 PrismaService，无需重复 import */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
