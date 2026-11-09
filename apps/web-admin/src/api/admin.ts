import type {
  DashboardVo,
  PaginatedResult,
  User,
  UserStatus,
} from '@dw/shared';
import { http } from '@/lib/http';

/** 管理端用户（脱敏，不含密码哈希） */
export type AdminUser = Omit<User, 'passwordHash'>;

/** 用户列表查询参数 */
export interface AdminUserQuery {
  page: number;
  pageSize: number;
  status?: UserStatus;
  keyword?: string;
}

/** 获取管理后台数据看板聚合数据 */
export function fetchDashboard() {
  return http.get<DashboardVo>('/admin/dashboard');
}

/** 分页获取用户列表（可按状态/关键词过滤） */
export function fetchAdminUsers(query: AdminUserQuery) {
  const params: Record<string, unknown> = {
    page: query.page,
    pageSize: query.pageSize,
  };
  if (query.status) params.status = query.status;
  if (query.keyword) params.keyword = query.keyword;
  return http.get<PaginatedResult<AdminUser>>('/admin/users', params);
}

/** 封禁/解封用户（切换状态） */
export function updateUserStatus(id: string, status: UserStatus) {
  return http.patch<AdminUser>(`/admin/users/${id}/status`, { status });
}
