import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { ClothingModule } from './clothing/clothing.module';
import { OutfitModule } from './outfit/outfit.module';

@Module({
  imports: [
    // 全局加载 .env，任意模块可注入 ConfigService
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClothingModule,
    OutfitModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
