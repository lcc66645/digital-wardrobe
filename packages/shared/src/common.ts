/**
 * 通用接口结构：统一响应、分页、错误码
 */

/** 后端统一响应包装（与全局响应拦截器对应） */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页查询参数 */
export interface PaginationQuery {
  page: number;
  pageSize: number;
}

/** 分页返回结果 */
export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 业务错误码约定 */
export enum BizCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500,
}
