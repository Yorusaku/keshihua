# 智造远望

面向制造场景的监控大屏、管理后台和 API 服务。仓库使用 pnpm workspace 与 Turborepo 管理 Vue 3 前端、NestJS 后端及共享包。

## 仓库结构

| 路径               | 职责                                                      |
| ------------------ | --------------------------------------------------------- |
| `apps/dashboard`   | 监控大屏，Vue 3、Pinia、Vue Query、ZRender；开发端口 5173 |
| `apps/admin`       | 管理后台，Vue 3、Ant Design Vue、AntV S2；开发端口 5174   |
| `apps/server`      | NestJS API、WebSocket 与 PostgreSQL 持久化；默认端口 8091 |
| `packages/shared`  | 认证、数据 Provider、查询、网络、实时通信与通用 UI        |
| `packages/charts`  | ZRender AGV 渲染器与 ECharts 趋势图                       |
| `packages/monitor` | 前端错误与性能监控 SDK                                    |
| `packages/config`  | TypeScript 与 Vite 基础配置                               |
| `e2e`              | Playwright 浏览器测试                                     |
| `docs`             | 项目说明、设计稿与 TDD 过程文档                           |

主要数据流：Dashboard 和 Admin 通过 `@packages/shared` 使用 Provider、认证和实时通信能力；API 服务提供 `/api` 路由及 `/ws` WebSocket 端点。Provider 支持 `auto`、`api`、`mock` 三种模式。模式解析优先级为：显式 `options.mode` 传入 `api`/`mock`，其次环境变量 `VITE_API_MODE`，最后才回退 `auto`；`auto` 会探测同源 `/api/health`，并校验响应 JSON 的 `ok === true`，不能用普通页面响应冒充 API 可用。

## 本地开发

要求 Node.js 20+、pnpm 9+。以下命令可单独启动前端开发服务器；完整数据链路还取决于 API 连通性与 Provider 模式。PowerShell 中从仓库根目录执行：

```powershell
pnpm install
pnpm --filter smart-dashboard dev
pnpm --filter @smart/admin dev
```

分别访问 `http://localhost:5173` 和 `http://localhost:5174`。两个 `dev` 命令应在不同终端运行。前端 mock 管理员账号为 `admin` / `admin123`，仅用于本地演示。

### 单独运行后端

后端使用 PostgreSQL 15。`apps/server/docker-compose.yml` 提供本地数据库，宿主机端口由 `PG_HOST_PORT` 控制，默认 5434；若该端口已被占用，可用 `$env:PG_HOST_PORT='5435'` 启动容器，并让后端 `PG_PORT` 指向同一个端口。先启动数据库，并在运行后端的终端设置 `JWT_SECRET`、`PG_HOST`、`PG_PORT`、`PG_USER`、`PG_PASSWORD`、`PG_DATABASE`；其中数据库变量需与实际数据库配置一致，`JWT_SECRET` 至少 16 个字符。不要将真实密钥或密码提交到仓库。

```powershell
docker compose -f apps/server/docker-compose.yml up -d
pnpm --filter @smart/server dev
```

首次使用空的本地开发库时，先运行 `pnpm --filter @smart/server exec ts-node src/database/sync.ts` 创建表，再启动后端；该脚本启用 TypeORM `synchronize: true`，不要用于有价值的数据。启动后可检查 `http://127.0.0.1:8091/api/health`。`pnpm --filter @smart/server seed` 会清空并重建多张表的演示数据，**仅在确认可丢弃现有数据时运行**。种子库管理员账号为 `admin` / `123456`，与前端 mock 账号不同。

Dashboard 和 Admin 的开发服务器都已把 `/api` 与 `/ws` 代理到 `http://127.0.0.1:8091`，因此同源请求可以直接联调。真实模式联调时建议显式设置 `$env:VITE_API_MODE='api'`：这样 `VITE_API_MODE` 会覆盖调用方传入的 `auto`，即使健康探测暂时失败也会按真实模式发起请求，而不是静默切换到 mock。`auto` 模式只用于需要自动降级的场景。

## 常用命令

在仓库根目录运行；`pnpm dev`、`pnpm build`、`pnpm test` 由 Turbo 调度工作区中定义了相应脚本的包。

| 用途             | 命令                                         |
| ---------------- | -------------------------------------------- |
| 启动全部应用     | `pnpm dev`                                   |
| 构建工作区       | `pnpm build`                                 |
| 运行工作区测试   | `pnpm test`                                  |
| 大屏类型检查     | `pnpm --filter smart-dashboard typecheck`    |
| 后端类型检查     | `pnpm --filter @smart/server typecheck`      |
| 运行单个包测试   | `pnpm --filter @packages/shared test`        |
| 运行后台测试一次 | `pnpm --filter @smart/admin exec vitest run` |
| 运行浏览器测试   | `pnpm exec playwright test`                  |

后端 `test` 是对运行在 8091 的服务发请求的集成测试，需要数据库、建表、种子数据及服务先就绪。Playwright 配置会尝试启动后端、大屏和后台三个服务，并复用已运行的进程，同样依赖数据库可用；未设置 `PG_PORT` 时默认 5434。后台包的 `test` 脚本是 Vitest 监听模式；执行一次请使用表中的 `vitest run` 命令。根目录 `lint` 会调用后端 `eslint --fix`，会改写源文件；根目录 `clean` 含 POSIX `rm -rf` 和不存在的 `reset` 脚本，不适合作为 Windows 清理命令。

## 代码入口与文档

- 大屏入口：`apps/dashboard/src/main.ts`、`apps/dashboard/src/views/Dashboard.vue`
- 后台入口：`apps/admin/src/main.ts`、`apps/admin/src/router/index.ts`
- 后端入口：`apps/server/src/main.ts`、`apps/server/src/app.module.ts`
- 数据来源：`packages/shared/src/provider/createDataProvider.ts`
- 实时通信：`packages/shared/src/websocket/README.md`
- 闭环实施：[前后端真实闭环实施计划](./docs/前后端真实闭环实施计划.md)
- 协作约定：[AGENTS.md](./AGENTS.md)；Claude 入口：[CLAUDE.md](./CLAUDE.md)

`docs/tdd` 记录历史设计与实施过程；当前行为请以源码、配置和可运行的测试为准。
