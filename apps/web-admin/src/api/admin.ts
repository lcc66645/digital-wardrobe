import type { DashboardVo } from '@dw/shared';
import { http } from '@/lib/http';

/** 获取管理后台数据看板聚合数据 */
export function fetchDashboard() {
  return http.get<DashboardVo>('/admin/dashboard');
}
