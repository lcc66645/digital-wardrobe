import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/** 健康检查：用于部署探活与服务可启动验证 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '服务健康检查' })
  check() {
    return {
      status: 'ok',
      service: 'digital-wardrobe-api',
      timestamp: new Date().toISOString(),
    };
  }
}
