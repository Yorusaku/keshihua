# 项目协作约定

本文件只记录此仓库的事实和开发边界；通用个人规则以会话或上级规则为准。开始修改前先阅读相关包的 `package.json`、入口代码和就近测试，不把 `docs/tdd` 中的历史阶段文档视为当前实现。

## 工作区

- pnpm 9 workspace + Turbo 2，Node.js 20+；包范围由 `pnpm-workspace.yaml` 定义。
- `apps/dashboard`：Vue 3 监控大屏，5173；`apps/admin`：Vue 3 管理后台，5174；`apps/server`：NestJS API 和 WebSocket，默认 8091。
- `packages/shared`：认证、Provider、网络、实时通信及通用 UI；`packages/charts`：ZRender/ECharts；`packages/monitor`：前端监控；`packages/config`：基础配置。
- 共享导出优先通过包入口使用。改动 `packages/shared` 或 `packages/charts` 时检查 Dashboard、Admin 两端消费者。

## 命令与验证

- 安装：`pnpm install`。应用开发：`pnpm --filter smart-dashboard dev`、`pnpm --filter @smart/admin dev`、`pnpm --filter @smart/server dev`。
- 构建：`pnpm build`。包测试：`pnpm --filter <包名> test`。Dashboard 和 Server 的类型检查分别使用 `pnpm --filter smart-dashboard typecheck`、`pnpm --filter @smart/server typecheck`。
- Admin 的 `test` 脚本为 Vitest 监听模式；一次性运行使用 `pnpm --filter @smart/admin exec vitest run`。
- Server 的测试访问运行中的 `http://127.0.0.1:8091/api`；Playwright 也要求数据库和后端环境先就绪。没有这些条件时明确记录未验证范围。
- 根目录 `lint` 会执行 Server 的 `eslint --fix`，可能改写代码；根目录 `clean` 在 Windows 下不可直接依赖。

## 实现边界

- 前端 mock 用户与后端种子用户的密码不同，详见 `README.md`；不要把演示凭据当作生产配置。
- Dashboard 和 Admin 目前使用 `createDataProvider({ mode: 'auto' })`；两端 Vite 配置没有 `/api` 代理。同源 API 联调需先核对代理、Provider 和认证路径。
- 后端启动必须满足 `apps/server/src/config/env.validation.ts` 的环境变量要求；不要写入真实密钥、密码或本地 `.env`。
- `apps/server/src/database/sync.ts` 使用 schema 同步；`seed` 会删除演示库中的已有记录。操作数据库前核对目标库，避免把这两个步骤用于有价值的数据。
- 变更只覆盖任务涉及的包与文档；优先复用已有 Vue 组件、共享模块、测试和脚本。新增行为至少运行与变更最接近的验证命令。
