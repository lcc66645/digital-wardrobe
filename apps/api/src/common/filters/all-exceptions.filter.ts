import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { ApiResponse } from '@dw/shared';

/**
 * 全局异常过滤器：把所有异常统一转换为 ApiResponse 结构 { code, message, data }。
 * - HttpException：沿用其 HTTP 状态码，兼容 class-validator 的 message 数组。
 * - 未知异常：返回 500，服务端记录详细堆栈，不向客户端泄漏内部细节。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const body = res as Record<string, unknown>;
        const msg = body.message;
        if (Array.isArray(msg)) {
          message = msg.join('；');
        } else if (typeof msg === 'string') {
          message = msg;
        } else if (typeof body.error === 'string') {
          message = body.error;
        }
      }
    } else {
      this.logger.error(
        `未处理异常: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiResponse<null> = {
      code: status,
      message,
      data: null,
    };
    response.status(status).json(body);
  }
}
