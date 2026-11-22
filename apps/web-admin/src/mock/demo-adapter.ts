/**
 * 管理端离线演示 axios adapter
 * 拦截全部管理端请求返回本地模拟数据，写操作直接修改内存数组
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  AuditStatus,
  ClothingCategory,
  ClothingStatus,
  DeviceOnlineStatus,
  Occasion,
  Season,
  UserStatus,
} from '@dw/shared';
import {
  demoAdmin,
  demoClothing,
  demoComments,
  demoDevices,
  demoOutfits,
  demoTrend,
  demoUsers,
} from './demo-data';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const envelope = (data: unknown) => ({ code: 0, message: 'ok', data });

const makeResponse = (data: unknown, config: InternalAxiosRequestConfig): AxiosResponse => ({
  data: envelope(data),
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const raw = config.data;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw as Record<string, unknown>;
}

interface PageShape {
  list: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function paginate(arr: unknown[], params: Record<string, unknown>): PageShape {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const start = (page - 1) * pageSize;
  return {
    list: arr.slice(start, start + pageSize),
    total: arr.length,
    page,
    pageSize,
    totalPages: Math.ceil(arr.length / pageSize),
  };
}

const countBy = <T extends string>(arr: readonly T[], keys: readonly T[]) =>
  keys.map((key) => ({ key, count: arr.filter((x) => x === key).length }));

/** 看板聚合（与 mock 列表自洽） */
function buildDashboard() {
  return {
    overview: {
      userTotal: demoUsers.length,
      bannedUserCount: demoUsers.filter((u) => u.status === UserStatus.BANNED).length,
      clothingTotal: demoClothing.length,
      outfitTotal: demoOutfits.length,
      publishedOutfitCount: demoOutfits.filter((o) => o.isPublished).length,
      pendingAuditCount: demoOutfits.filter((o) => o.auditStatus === AuditStatus.PENDING).length,
      deviceTotal: demoDevices.length,
      onlineDeviceCount: demoDevices.filter((d) => d.onlineStatus === DeviceOnlineStatus.ONLINE).length,
      pendingFeedbackCount: 2,
    },
    trend: demoTrend,
    clothingByCategory: countBy(
      demoClothing.map((c) => c.category),
      Object.values(ClothingCategory),
    ),
    clothingByStatus: countBy(
      demoClothing.map((c) => c.status),
      Object.values(ClothingStatus),
    ),
    outfitByAudit: countBy(
      demoOutfits.map((o) => o.auditStatus),
      Object.values(AuditStatus),
    ),
    generatedAt: '2026-11-22T04:00:00.000Z',
  };
}

/** 算法数据底座聚合（仅统计在用衣物） */
function buildAlgorithm() {
  const inUse = demoClothing.filter((c) => c.status === ClothingStatus.IN_USE);
  const totalWearCount = inUse.reduce((s, c) => s + c.wearCount, 0);
  const requiredCategories = [
    ClothingCategory.TOP,
    ClothingCategory.BOTTOM,
    ClothingCategory.OUTERWEAR,
    ClothingCategory.SHOES,
  ];
  const categoryCoverage = Object.values(ClothingCategory).map((category) => {
    const count = inUse.filter((c) => c.category === category).length;
    const required = requiredCategories.includes(category);
    return { category, count, required, gap: required && count === 0 };
  });
  const seasonKeys = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER];
  const seasonDistribution = seasonKeys.map((key) => ({
    key,
    count: inUse.filter((c) => c.seasons.includes(key)).length,
  }));
  const occasionKeys = Object.values(Occasion);
  const occasionDistribution = occasionKeys.map((key) => ({
    key,
    count: inUse.filter((c) => c.occasion === key).length,
  }));
  return {
    metrics: {
      clothingTotal: demoClothing.length,
      inUseClothingCount: inUse.length,
      totalWearCount,
      avgWearCount: inUse.length ? Number((totalWearCount / inUse.length).toFixed(1)) : 0,
      idleClothingCount: inUse.filter((c) => c.wearCount === 0).length,
      outfitTotal: demoOutfits.length,
      publicOutfitCount: demoOutfits.filter(
        (o) => o.isPublished && o.auditStatus === AuditStatus.APPROVED,
      ).length,
    },
    categoryCoverage,
    seasonDistribution,
    occasionDistribution,
    occasionUnsetCount: inUse.filter((c) => c.occasion === null).length,
    lifecycleDistribution: countBy(
      demoClothing.map((c) => c.status),
      Object.values(ClothingStatus),
    ),
    rules: [
      { stage: '候选过滤', name: '在用单品入池', description: '仅 status=IN_USE 的衣物进入推荐候选池，收纳/捐赠/转卖/丢弃不参与。', status: 'ACTIVE' },
      { stage: '排序', name: '闲置优先盘活', description: '在用但穿着次数低的单品在推荐中加权，优先提升利用率。', status: 'ACTIVE' },
      { stage: '品类补齐', name: '必备品类缺口检测', description: '上装/下装/外套/鞋履为必备，在用数量为 0 时标记缺口并提示补充。', status: 'ACTIVE' },
      { stage: '场景适配', name: '天气与日程联动', description: '结合实时天气与用户日程调整场合与季节权重，依赖外部天气接口。', status: 'PLANNED' },
      { stage: '效果度量', name: '曝光点击转化回流', description: '推荐曝光、点击率、转化率经埋点回流后在线评估策略效果。', status: 'PLANNED' },
    ],
    generatedAt: '2026-11-22T04:00:00.000Z',
  };
}

export const demoAdapter: AxiosAdapter = async (config) => {
  await sleep(240);
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = (config.params || {}) as Record<string, unknown>;
  const body = parseBody(config);

  // 登录
  if (method === 'post' && url === '/auth/login') {
    return makeResponse({ accessToken: 'demo-admin-token', user: demoAdmin }, config);
  }
  // 当前管理员资料
  if (method === 'get' && url === '/auth/profile') {
    return makeResponse(demoAdmin, config);
  }
  // 看板
  if (method === 'get' && url === '/admin/dashboard') {
    const dash = buildDashboard();
    return makeResponse(dash, config);
  }
  // 算法
  if (method === 'get' && url === '/admin/algorithm/overview') {
    return makeResponse(buildAlgorithm(), config);
  }

  // 用户：封禁/解封
  let m = url.match(/^\/admin\/users\/([^/]+)\/status$/);
  if (method === 'patch' && m) {
    const target = demoUsers.find((u) => u.id === m![1]);
    if (target) target.status = body.status as UserStatus;
    return makeResponse(target ?? null, config);
  }
  // 用户列表
  if (method === 'get' && url === '/admin/users') {
    let arr = demoUsers.slice();
    if (params.status) arr = arr.filter((u) => u.status === params.status);
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase();
      arr = arr.filter(
        (u) =>
          u.nickname.toLowerCase().includes(kw) ||
          (u.phone ?? '').includes(String(params.keyword)),
      );
    }
    return makeResponse(paginate(arr, params), config);
  }

  // 衣物：调整状态
  m = url.match(/^\/admin\/clothing\/([^/]+)\/status$/);
  if (method === 'patch' && m) {
    const target = demoClothing.find((c) => c.id === m![1]);
    if (target) target.status = body.status as ClothingStatus;
    return makeResponse(target ?? null, config);
  }
  // 衣物列表
  if (method === 'get' && url === '/admin/clothing') {
    let arr = demoClothing.slice();
    if (params.category) arr = arr.filter((c) => c.category === params.category);
    if (params.status) arr = arr.filter((c) => c.status === params.status);
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase();
      arr = arr.filter(
        (c) => c.name.toLowerCase().includes(kw) || (c.color ?? '').includes(String(params.keyword)),
      );
    }
    return makeResponse(paginate(arr, params), config);
  }

  // 穿搭：审核
  m = url.match(/^\/admin\/outfits\/([^/]+)\/audit$/);
  if (method === 'patch' && m) {
    const target = demoOutfits.find((o) => o.id === m![1]);
    if (target) target.auditStatus = body.auditStatus as AuditStatus;
    return makeResponse(target ?? null, config);
  }
  // 某穿搭评论
  m = url.match(/^\/admin\/outfits\/([^/]+)\/comments$/);
  if (method === 'get' && m) {
    return makeResponse(demoComments.filter((c) => c.outfitId === m![1]), config);
  }
  // 穿搭列表
  if (method === 'get' && url === '/admin/outfits') {
    let arr = demoOutfits.slice();
    if (params.auditStatus) arr = arr.filter((o) => o.auditStatus === params.auditStatus);
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase();
      arr = arr.filter((o) => (o.content ?? '').toLowerCase().includes(kw));
    }
    return makeResponse(paginate(arr, params), config);
  }

  // 设备：强制解绑
  m = url.match(/^\/admin\/devices\/([^/]+)\/binding$/);
  if (method === 'delete' && m) {
    const target = demoDevices.find((d) => d.id === m![1]);
    if (target) {
      target.userId = null;
      target.ownerName = null;
      target.ownerPhone = null;
    }
    return makeResponse(target ?? null, config);
  }
  // 设备列表
  if (method === 'get' && url === '/admin/devices') {
    let arr = demoDevices.slice();
    if (params.onlineStatus) arr = arr.filter((d) => d.onlineStatus === params.onlineStatus);
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase();
      arr = arr.filter(
        (d) => d.sn.toLowerCase().includes(kw) || (d.firmwareVersion ?? '').includes(String(params.keyword)),
      );
    }
    return makeResponse(paginate(arr, params), config);
  }

  // 兜底
  return makeResponse(null, config);
};
