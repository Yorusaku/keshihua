# 📦 @packages/charts/zrender

**状态**：🔵 蓝灯阶段（设计对齐）  
**负责人**：高级前端架构师  
**日期**：2026年3月6日

---

## 📌 模块说明

本目录为 **AgvRenderer（AGV 纯 Canvas 渲染引擎）** 的实现区域，包含以下内容：

| 目录/文件 | 状态 | 说明 |
|-----------|------|------|
| `__tests__/` | ✅ 预留 | 红灯阶段测试用例 |
| `README.md` | ✅ 本文件 | 模块说明文档 |
| `AgvRenderer.ts` | ❌ 待实现 | 核心渲染器类（V5 规约禁止现在编写） |
| `types.ts` | ❌ 待实现 | 类型定义（V5 规约禁止现在编写） |
| `index.ts` | ❌ 待实现 | 导出文件（V5 规约禁止现在编写） |

---

## 🔵 蓝灯阶段设计提案

**文档路径**：`docs/tdd/AgvRenderer/AgvRenderer-0-蓝灯设计提案-20260306.md`

### 核心设计要点

1. **完全解耦**：独立原生类，无 Vue 依赖
2. **ZRender 原生**：使用 `zrender.init()` + `requestAnimationFrame`
3. **批量更新**：从 `DataBuffer.getSnapshot()` 批量拉取数据
4. **资源管理**：明确的 `dispose()` 方法，防止内存泄漏

### MVP 边界

- ❌ 不包含 Vue 组件封装
- ❌ 不包含复杂动画（仅坐标更新）
- ❌ 不包含鼠标交互事件
- ❌ 不包含多图层管理

---

## 🔄 下一步行动

**等待产品经理（您）确认蓝灯设计提案**：

> 请回复「同意」进入🔴 红灯阶段（编写测试用例），或提出修改意见。

---

## 📁 目录结构（红灯阶段后）

```
packages/charts/src/zrender/
├── __tests__/              # 红灯阶段测试用例目录
│   ├── AgvRenderer.test.ts
│   ├── AgvRenderer-ivite.test.ts
│   └── setup.ts
├── AgvRenderer.ts          # 🟢 绿灯阶段实现
├── types.ts                # 🟢 绿灯阶段实现
├── index.ts                # 🟢 绿灯阶段实现
└── README.md               # ✅ 本文件（不可删除）
```
