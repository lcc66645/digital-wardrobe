import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 统一路由前缀
  app.setGlobalPrefix('api');

  // 全局参数校验：自动剥离未声明字段、类型转换、拒绝多余字段
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 全局异常过滤器与统一响应拦截器
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 跨域，供移动端与 Web 后台调用
  app.enableCors();

  // Swagger 文档（/api/docs）
  const config = new DocumentBuilder()
    .setTitle('数字衣橱 API')
    .setDescription('数字衣橱后端接口文档（NestJS + Prisma）')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  logger.log(`应用已启动: http://localhost:${port}/api`);
  logger.log(`Swagger 文档: http://localhost:${port}/api/docs`);
}

void bootstrap();
