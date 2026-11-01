# 数字衣橱 Digital Wardrobe

软硬一体的智能穿搭产品：手机吸附硬件 + 穿搭移动 App + Web 管理后台。

## 技术栈

全 TypeScript monorepo（npm workspaces）。

| 模块 | 目录 | 技术栈 |
|---|---|---|
| 移动端 | `apps/mobile` | React Native + TypeScript、React Navigation、Zustand、react-native-ble-plx、axios |
| 后端 | `apps/api` | NestJS + TypeScript、Prisma、JWT、Swagger、class-validator |
| Web 后台 | `apps/web-admin` | React + TypeScript + Vite + Ant Design、React Router、axios |
| 共享包 | `packages/shared` | 前后端共用 TS 类型、枚举、DTO |

数据库：开发期使用 SQLite（Prisma，零配置），schema 保持可平滑切换 PostgreSQL。

## 目录结构

```
digital-wardrobe/
├── apps/
│   ├── mobile/        # 移动端 App
│   ├── api/           # 后端服务
│   └── web-admin/     # Web 管理后台
├── packages/
│   └── shared/        # 共享类型与枚举
├── package.json       # npm workspaces 根配置
└── tsconfig.base.json # TS 基础配置
```

## 快速开始

```bash
# 安装全部依赖（在根目录）
npm install

# 后端：生成 Prisma 客户端并执行迁移
npm run prisma:generate
npm run prisma:migrate

# 启动后端开发服务（默认 http://localhost:3000，Swagger /docs）
npm run dev:api

# 启动 Web 管理后台（默认 http://localhost:5173）
npm run dev:web
```

## 开发约定

- 所有代码使用 TypeScript，开启严格模式；提交前通过 `npm run typecheck`。
- 后端接口统一通过全局响应拦截器返回，异常经全局异常过滤器处理。
- 不写死 SQLite 专有语法，保证数据库可平滑切换 PostgreSQL。
