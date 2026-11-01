import {
  CallHandler,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { BizCode, type ApiResponse } from '@dw/shared';

/**
 * 统一响应拦截器：把 controller 的返回值包装为 ApiResponse
 * { code: 0, message: 'success', data }。
 * 若返回值本身已是 ApiResponse 结构则原样透传，避免重复包装。
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    _context: Parameters<NestInterceptor<T>['intercept']>[0],
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((payload) => {
        if (
          payload &&
          typeof payload === 'object' &&
          'code' in payload &&
          'message' in payload &&
          'data' in payload
        ) {
          return payload;
        }
        return {
          code: BizCode.SUCCESS,
          message: 'success',
          data: payload,
        } satisfies ApiResponse<T>;
      }),
    );
  }
}
