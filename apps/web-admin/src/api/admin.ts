import type {
  AdminClothingVo,
  AdminCommentVo,
  AdminDeviceVo,
  AdminOutfitVo,
  AuditStatus,
  ClothingCategory,
  ClothingStatus,
  DashboardVo,
  DeviceOnlineStatus,
  PaginatedResult,
  User,
  UserStatus,
} from '@dw/shared';
import { http } from '@/lib/http';

/** 管理端用户（脱敏，不含密码哈希） */
export type AdminUser = Omit<User, 'passwordHash'>;

/** 管理端衣物（含所属用户摘要，seasons/tags 已解析） */
export type AdminClothing = AdminClothingVo;

/** 管理端穿搭（含作者摘要，tags 已解析） */
export type AdminOutfit = AdminOutfitVo;

/** 管理端评论（含作者摘要） */
export type AdminComment = AdminCommentVo;

/** 管理端设备（含绑定用户摘要） */
export type AdminDevice = AdminDeviceVo;

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

/** 穿搭列表查询参数 */
export interface AdminOutfitQuery {
  page: number;
  pageSize: number;
  auditStatus?: AuditStatus;
  userId?: string;
  keyword?: string;
}

/** 设备列表查询参数 */
export interface AdminDeviceQuery {
  page: number;
  pageSize: number;
  onlineStatus?: DeviceOnlineStatus;
  userId?: string;
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

/** 分页获取穿搭列表（可按审核状态/作者/关键词过滤） */
export function fetchAdminOutfits(query: AdminOutfitQuery) {
  const params: Record<string, unknown> = {
    page: query.page,
    pageSize: query.pageSize,
  };
  if (query.auditStatus) params.auditStatus = query.auditStatus;
  if (query.userId) params.userId = query.userId;
  if (query.keyword) params.keyword = query.keyword;
  return http.get<PaginatedResult<AdminOutfit>>('/admin/outfits', params);
}

/** 穿搭审核（通过/驳回） */
export function auditOutfit(id: string, auditStatus: AuditStatus) {
  return http.patch<AdminOutfit>(`/admin/outfits/${id}/audit`, { auditStatus });
}

/** 获取某条穿搭的评论列表 */
export function fetchOutfitComments(id: string) {
  return http.get<AdminComment[]>(`/admin/outfits/${id}/comments`);
}

/** 分页获取设备列表（可按在线状态/用户/关键词过滤） */
export function fetchAdminDevices(query: AdminDeviceQuery) {
  const params: Record<string, unknown> = {
    page: query.page,
    pageSize: query.pageSize,
  };
  if (query.onlineStatus) params.onlineStatus = query.onlineStatus;
  if (query.userId) params.userId = query.userId;
  if (query.keyword) params.keyword = query.keyword;
  return http.get<PaginatedResult<AdminDevice>>('/admin/devices', params);
}

/** 管理员强制解绑设备 */
export function unbindDevice(id: string) {
  return http.delete<AdminDevice>(`/admin/devices/${id}/binding`);
}
