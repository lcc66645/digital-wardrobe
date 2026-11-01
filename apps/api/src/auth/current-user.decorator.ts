import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from './jwt.strategy';

/**
 * 取出当前登录用户：@CurrentUser() 取整个 RequestUser，
 * @CurrentUser('userId') 取指定字段。
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: RequestUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
