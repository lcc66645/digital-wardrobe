import type {
  AdminClothingVo,
  ClothingCategory,
  ClothingStatus,
  DashboardVo,
  PaginatedResult,
  User,
  UserStatus,
} from '@dw/shared';
import { http } from '@/lib/http';

/** 管理端用户（脱敏，不含密码哈希） */
export type AdminUser = Omit<User, 'passwordHash'>;

/** 管理端衣物（含所属用户摘要，seasons/tags 已解析） */
export type AdminClothing = AdminClothingVo;

/** 衣物列表查询参数 */
export interface AdminClothingQuery {
  page: number;
  pageSize: number;
  category?: ClothingCategory;
  status?: ClothingStatus;
  userId?: string;
  keyword?: string;
}

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

/** 分页获取衣物列表（可按品类/状态/用户/关键词过滤） */
export function fetchAdminClothing(query: AdminClothingQuery) {
  const params: Record<string, unknown> = {
    page: query.page,
    pageSize: query.pageSize,
  };
  if (query.category) params.category = query.category;
  if (query.status) params.status = query.status;
  if (query.userId) params.userId = query.userId;
  if (query.keyword) params.keyword = query.keyword;
  return http.get<PaginatedResult<AdminClothing>>('/admin/clothing', params);
}

/** 调整衣物生命周期状态 */
export function updateClothingStatus(id: string, status: ClothingStatus) {
  return http.patch<AdminClothing>(`/admin/clothing/${id}/status`, { status });
}
