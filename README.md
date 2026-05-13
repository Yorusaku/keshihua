# 智造远望 - 智慧工厂可视化大屏

<div align="center">

**面向制造企业的生产监控与协同管理系统**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5+-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)]
[![NestJS](https://img.shields.io/badge/NestJS-10.4+-E0234E.svg)]
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0+-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.3+-EF4444.svg)](https://turbo.build/)

</div>

## 📖 项目简介

"智造远望"是一套面向制造企业的生产监控与协同管理系统，前端包含 **Dashboard 大屏**和 **Admin 后台**两端。

- **Dashboard 大屏**：负责展示产能态势、AGV 运行状态和传感器异常，强调实时性和低干扰
- **Admin 后台**：负责设备台账、策略配置和报表分析，强调可追踪和可维护

整体形成 **"监控发现问题 → 定位影响范围 → 告警确认 → 后台追踪处理"** 的业务闭环。

### 核心价值

项目的核心价值不在于堆砌可视化组件，而在于：
- 把高频实时渲染、低频统计分析和后台支撑能力拆成边界清晰的前端模块
- 保证大屏流畅性、状态一致性和跨端协同效率
- 通过 Monorepo 架构沉淀可复用的基础设施

## 🏗️ 技术架构

### 技术栈

| 分类 | 技术选型 |
|------|---------|
| **前端框架** | Vue 3 + TypeScript + Composition API |
| **构建工具** | Vite 5 + Turborepo 2 |
| **包管理** | pnpm workspace (Monorepo) |
| **状态管理** | Pinia + @tanstack/vue-query |
| **可视化** | ECharts + ZRender + AntV S2 |
| **UI 组件** | Ant Design Vue (Admin) |
| **工具库** | @vueuse/core |
| **测试框架** | Vitest + @vue/test-utils |

### 架构设计

```text
smart-manufacturing-mono/
├── apps/
│   ├── dashboard/            # 工业监控驾驶舱（实时态势感知）
│   └── admin/                # 闭环支撑后台（设备管理与报表分析）
├── packages/
│   ├── shared/               # 共享层：provider、query、types、websocket
│   ├── charts/               # 图表渲染能力：zrender / echarts
│   ├── monitor/              # 端侧监控：异常采集与性能观测
│   └── config/               # 基础配置：TS / Vite 等
├── docs/                     # TDD 文档与实施记录
├── turbo.json                # Turborepo 配置
└── pnpm-workspace.yaml       # pnpm workspace 配置
```

### 核心设计理念

#### 1. 状态分治策略

- **服务端状态**（vue-query）：低频、可缓存、以接口为准的数据
  - 产能概览、传感器趋势、报表查询
  - 自动处理缓存、轮询、重试和失效
  
- **客户端状态**（Pinia）：与界面交互直接相关的状态
  - 筛选条件、详情抽屉、聚焦对象、深链参数
  
- **高频实时数据**（Map/DataBuffer）：不进入深响应式链路
  - AGV 坐标和运行态
  - 通过 `requestAnimationFrame` 驱动渲染，避免对 Vue 渲染系统造成持续压力

#### 2. 渲染链路分离

| 场景 | 渲染方案 | 适用数据 |
|------|---------|---------|
| 宏观趋势与统计 | ECharts | 产能趋势、传感器时序、概览指标 |
| AGV 主舞台 | ZRender + RAF | 高频坐标更新、实时运行态 |
| 后台大体量报表 | Canvas 透视表 | 复杂行列结构、高密度数据展示 |

#### 3. 数据流转链路

```text
┌─────────────────────────────────────────────────────────────┐
│                      服务端状态链路                           │
│  vue-query → 缓存/轮询/重试 → 页面消费聚合结果                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      高频渲染链路                             │
│  WebSocket → DataBuffer/Map → RAF → ZRender 节点更新         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      闭环协同链路                             │
│  异常卡片 → 大屏确认 → 深链跳转 → 后台追踪（带上下文）        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 启动 Dashboard 大屏
pnpm --filter smart-dashboard dev

# 启动 Admin 后台
pnpm --filter @smart/admin dev
```

### 构建生产版本

```bash
# 构建所有应用
pnpm build

# 构建指定应用
pnpm --filter smart-dashboard build
pnpm --filter @smart/admin build
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行指定包的测试
pnpm --filter @packages/shared test
pnpm --filter @packages/monitor test
```

### 代码格式化

```bash
pnpm format
```

### 清理构建产物

```bash
pnpm clean
```

## 📦 Monorepo 结构

### Apps

| 应用 | 说明 | 端口 | 技术栈 |
|------|------|------|--------|
| **dashboard** | 工业监控驾驶舱 | - | Vue 3 + ZRender + ECharts + Pinia |
| **admin** | 闭环支撑后台 | - | Vue 3 + Ant Design Vue + Vue Router |

### Packages

| 包 | 说明 | 主要导出 |
|------|------|---------|
| **@packages/shared** | 共享层基础设施 | provider、query、types、websocket、network |
| **@packages/charts** | 图表渲染能力 | ZRender 组件、ECharts 组件 |
| **@packages/monitor** | 端侧监控 SDK | initMonitor、MonitorConfig、错误采集、性能观测 |
| **@packages/config** | 基础配置 | TypeScript / Vite 配置 |

## 🎯 核心功能

### Dashboard 大屏

- ✅ **实时 AGV 监控**：基于 ZRender 的高频渲染，支持大量 AGV 节点实时更新
- ✅ **传感器异常展示**：实时展示传感器异常状态和趋势图
- ✅ **产能态势看板**：宏观产能概览和趋势分析
- ✅ **事件轨与告警**：异常事件时间轴和影响范围定位
- ✅ **跨端协同**：通过 BroadcastChannel 实现跨 Tab/窗口通信

### Admin 后台

- ✅ **设备台账管理**：AGV 设备信息的增删改查
- ✅ **传感器趋势分析**：基于 LTTB 算法的大数据量时序图
- ✅ **产能报表查询**：基于 AntV S2 的透视表分析
- ✅ **策略配置**：设备策略和告警规则配置
- ✅ **深链跳转**：从大屏带上下文跳转到后台详情页

## 🔧 技术亮点

### 1. 高频实时渲染与响应式边界控制

**问题**：AGV 坐标属于高频变化数据，如果直接放进深响应式状态，更新频率和节点规模一上来，主线程很容易被拖垮。

**解决方案**：
- 采用 `Map/DataBuffer + requestAnimationFrame + ZRender` 的方式
- 把高频数据缓冲、节点更新和页面状态管理拆开
- 只让 Vue 管理需要进入模板的低频控制状态

**价值**：不是简单"绕开框架"，而是在性能敏感场景下主动划清响应式边界。

### 2. 服务端状态与客户端状态分治

**设计原则**：
- `vue-query` 负责服务端状态快照（缓存、轮询、重试和失效）
- `Pinia` 只维护客户端交互状态（筛选项、弹窗状态等）

**价值**：减少页面内手写轮询、缓存和重试逻辑，避免把接口数据、筛选项和弹窗状态混在一个 store 里。

### 3. 统一 Provider 与单一数据源策略

**特性**：
- 支持 `auto | api | mock` 三种模式
- 运行时只会选择一个最终来源，不做真实接口与 mock 数据混用
- 页面消费的是统一视图模型，而不是零散接口结果

**价值**：同时满足演示环境、联调环境和正式接口接入阶段的需求，又不会让页面逻辑被分叉条件污染。

### 4. 大数据量趋势图优化

**场景**：传感器时序和产能趋势图的数据量拉长到月级别时，浏览器端渲染成为瓶颈。

**解决方案**：
- 采用 LTTB（Largest Triangle Three Buckets）降采样算法
- 优先保留趋势和异常峰值，避免把大量无效重叠点直接压给浏览器

**价值**：提升图表渲染性能，保持数据表达效率。

### 5. 后台大体量报表与透视分析

**场景**：承接多维度、跨产线、跨班次的数据浏览需求。

**解决方案**：
- 采用 Canvas 透视表方案（AntV S2）
- 在复杂表头和大数据量下保持更稳定的滚动与交互体验

**价值**：避免传统 DOM 表格在大数据量下的滚动卡顿与样式抖动。

### 6. 零依赖前端监控 SDK

**特性**：
- 自动捕获 JS 错误、Promise 异常、资源加载失败
- 性能指标采集（FCP、LCP、FID、CLS）
- 网络请求监控（fetch/xhr）
- WebSocket 异常监控
- 批量上报与队列管理

**价值**：对于大屏这类长时间运行的前端系统，稳定性不是附加项，监控能力补充异常采集、性能指标和网络链路观察，用来支撑现场问题排查。

## 📚 核心模块说明

### @packages/shared

共享层基础设施，提供跨端复用的核心能力。

**主要导出**：

```typescript
// 监控 SDK
export { initMonitor } from '@packages/monitor';
export type { MonitorConfig } from '@packages/monitor';

// 网络层
export * from './network';  // API、Query Hooks、QueryClient

// WebSocket
export * from './websocket';  // DataBuffer、AgvSyncBus、MonitorableWebSocket

// Provider
export * from './provider';  // 统一数据提供器
```

**核心能力**：
- **网络层**：基于 `@tanstack/vue-query` 的查询封装
- **WebSocket**：高频数据缓冲池、跨端通信总线、带监控的 WebSocket
- **Provider**：统一数据提供器，支持 auto/api/mock 三种模式

### @packages/charts

图表渲染能力包，提供 ZRender 和 ECharts 组件。

**主要导出**：

```typescript
// ZRender 组件
export { AgvRenderer } from './zrender';

// ECharts 组件
export { TrendChart } from './echarts';
```

### @packages/monitor

零依赖前端监控 SDK，提供异常采集与性能观测能力。

**主要导出**：

```typescript
export { initMonitor } from './index';
export type { MonitorConfig, ErrorData, CustomReportData } from './types';
```

**使用示例**：

```typescript
import { initMonitor } from '@packages/monitor';

const monitor = initMonitor({
  dsn: '/api/report',
  appId: 'dashboard',
  error: true,
  performance: true,
  network: true,
  debug: import.meta.env.DEV,
});
```


### 后端服务（全栈改造 v2.0）

| 分类 | 技术选型 |
|------|---------|
| **后端框架** | NestJS 10 + TypeScript |
| **数据库** | PostgreSQL 15 (TypeORM) |
| **认证** | Passport JWT + bcryptjs |
| **WebSocket** | NestJS Gateway (ws) |
| **API 文档** | Swagger (OpenAPI) |
| **测试** | Vitest (集成测试) |
| **部署** | Docker Compose |

#### 数据模式

前端支持三种 API 模式，通过 `VITE_API_MODE` 环境变量切换：

| 模式 | 说明 |
|------|------|
| `mock` (默认) | 纯前端 mock，无需后端 |
| `real` | 强制走真实 API，后端不可用时直接报错 |
| `auto` (推荐) | 自动探测 `/api/health`，有后端走真实，无后端回退 mock |

## 📡 API 端点

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| **Auth** | POST | `/api/auth/login` | 登录，返回 JWT |
| | POST | `/api/auth/register` | 注册 |
| | GET | `/api/auth/me` | 当前用户 |
| **AGV** | GET | `/api/agvs` | 分页+搜索 |
| | POST | `/api/agvs` | 新增 |
| | PATCH | `/api/agvs/:id` | 更新坐标/状态 |
| | DELETE | `/api/agvs/:id` | 删除 |
| **Alert** | GET | `/api/alerts` | 分页查询 |
| | POST | `/api/alerts` | 创建 |
| | POST | `/api/alerts/:id/acknowledge` | 确认告警 |
| | POST | `/api/alerts/:id/assign` | 指派处理人(乐观锁) |
| | POST | `/api/alerts/:id/close` | 关闭(计算 MTTR) |
| **Capacity** | GET | `/api/capacity/report` | 产能报表 |
| **Production** | GET | `/api/production-lines` | 产线+区域 |
| **Health** | GET | `/api/health` | 健康检查 |

## 🚀 本地启动

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 PostgreSQL (端口 5434)
cd apps/server && docker compose up -d

# 3. 建表 + 灌种子数据（仅首次）
cd apps/server
npx ts-node src/database/sync.ts
npx ts-node src/database/seed.ts

# 4. 编译并启动后端 (端口 8091)
cd apps/server
npx nest build
$env:JWT_SECRET='smart-manufacturing-jwt-secret-2024'
$env:PG_HOST='127.0.0.1'
$env:PG_PORT='5434'
$env:PG_USER='postgres'
$env:PG_PASSWORD='smart123'
$env:PG_DATABASE='smart_manufacturing'
node dist/main.js

# 5. 启动前端 (自动探测后端)
$env:VITE_API_MODE='auto'
pnpm dev
```

演示账号：`admin` / `123456`
## 🧪 测试策略

项目采用 TDD（Test-Driven Development）开发模式，遵循 **红灯 → 绿灯 → 重构** 的迭代流程。

### 测试覆盖

- **单元测试**：核心工具函数、数据处理逻辑
- **组件测试**：Vue 组件的渲染和交互
- **集成测试**：查询 Hooks、Provider、WebSocket

### 运行测试

```bash
# 前端测试
pnpm test

# 后端集成测试 (13 用例，覆盖 Auth/AGV/Alert/Capacity/ProductionLine)
cd apps/server && npx vitest run

# 监听模式
pnpm --filter @packages/shared test:watch
```

## 📖 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 使用 Composition API + `<script setup>`
- 使用 Prettier 格式化代码

### 提交规范

遵循 Conventional Commits 规范：

```bash
feat: 新增功能
fix: 修复 bug
refactor: 重构代码
docs: 文档更新
test: 测试相关
chore: 构建/工具链相关
```

### 分支策略

- `master`：主分支，保持稳定
- `feature/*`：功能分支
- `fix/*`：修复分支
- `refactor/*`：重构分支

## 🔗 相关文档

- [项目说明文档](./docs/智造远望-项目说明-结构优化版.md)
- [实施记录](./docs/实施记录-20260321-工业驾驶舱闭环改造.md)
- [TDD 文档](./docs/tdd/)
- [WebSocket 模块说明](./packages/shared/src/websocket/README.md)

## 📝 常见问题

### 为什么 AGV 渲染没有直接走 Vue 响应式？

因为高频坐标更新和组件渲染更新不是一个量级的问题。Vue 很适合处理筛选条件、弹窗、详情抽屉这类交互状态，但不适合承担每秒多次、成百上千节点的坐标更新。这里把高频数据放进 `Map/DataBuffer`，再由 `requestAnimationFrame` 驱动 `ZRender` 更新，是为了把数据写入压力和组件更新压力拆开。

### 为什么同时使用 Vue Query 和 Pinia？

因为它们解决的是两类不同问题。`vue-query` 负责服务端状态快照，例如缓存、轮询、重试和失效；`Pinia` 负责界面交互状态，例如当前筛选项、焦点对象和抽屉显隐。这样分层以后，页面代码会更稳定，也更容易解释状态边界。

### 为什么这个项目适合用 Monorepo？

因为 dashboard 和 admin 在展示层差异很大，但底层类型、数据模型、网络查询和监控能力高度重合。Monorepo 可以把这些基础设施抽到共享包里统一维护，既避免复制代码，也降低双端口径不一致的问题。

## 📄 License

MIT

---

<div align="center">
Made with ❤️ by Smart Manufacturing Team
</div>
