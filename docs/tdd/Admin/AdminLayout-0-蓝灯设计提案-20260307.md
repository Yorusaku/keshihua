# AdminLayout-0-蓝灯设计提案-20260307

## 🎯 需求概述

在 Monorepo 中启动 `apps/admin`，搭建标准中后台的 Layout 骨架，并引入组件库（Element Plus）实现一个简单的表格页，以此验证 `@packages/shared` 的跨应用复用能力。

---

## 📋 1. 技术栈与依赖规划

### 1.1 核心依赖

| 包名 | 版本 | 用途 | 安装方式 |
|------|------|------|----------|
| `vue-router` | ^4.2.5 | 路由管理（SPA 单页应用） | `pnpm add vue-router` |
| `pinia` | ^2.1.7 | 状态管理（替代 Vuex） | `pnpm add pinia` |
| `element-plus` | ^2.6.0 | UI 组件库（中后台组件） | `pnpm add element-plus` |
| `@element-plus/icons-vue` | ^2.3.1 | Element Plus 图标库 | `pnpm add @element-plus/icons-vue` |
| `unplugin-vue-components` | ^0.26.0 | Element Plus 按需引入 | `pnpm add -D unplugin-vue-components` |
| `unplugin-auto-import` | ^0.17.0 | 自动导入 Vue API | `pnpm add -D unplugin-auto-import` |

### 1.2 共享依赖（来自 `@packages/shared`）

| 包/模块 | 用途 | 导入路径 |
|---------|------|---------|
| `@packages/shared` | 核心共享包 | `import { DataBuffer } from '@packages/shared'` |
| `queryClient` | Vue Query 客户端实例 | `import { queryClient } from '@packages/shared'` |
| `CapacityData` | 产能数据类型 | `import type { CapacityData } from '@packages/shared'` |
| `IAgvData` | AGV 数据类型（预留） | `import type { IAgvData } from '@packages/shared'` |

### 1.3 依赖配置策略

#### pnpm Workspace 配置

在 `apps/admin/package.json` 中添加：

```json
{
  "dependencies": {
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "element-plus": "^2.6.0",
    "@element-plus/icons-vue": "^2.3.1"
  },
  "devDependencies": {
    "@packages/shared": "workspace:*"
  }
}
```

#### Element Plus 按需引入（推荐方案）

使用 `unplugin-vue-components` 自动按需引入组件：

```typescript
// apps/admin/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
});
```

**优势**：
- ✅ 减少打包体积（只引入实际使用的组件）
- ✅ 自动导入组件和图标
- ✅ 符合 Element Plus 官方推荐方案

---

## 📋 2. 目录结构规划

### 2.1 完整目录结构

```
apps/admin/
├─ src/
│  ├─ router/                    # 路由配置
│  │  ├─ index.ts                # 路由实例（静态路由）
│  │  ├─ routes/                 # 路由定义
│  │  │  ├─ index.ts             # 路由聚合
│  │  │  ├─ static.ts            # 静态路由（无需权限）
│  │  │  └─ dynamic.ts           # 动态路由（需权限，预留）
│  │  └─ guards/                 # 路由守卫
│  │     ├─ beforeEach.ts        # 路由前置守卫
│  │     └─ afterEach.ts         # 路由后置守卫
│  │
│  ├─ layout/                    # Layout 骨架组件
│  │  ├─ AdminLayout.vue         # 主布局（左右结构）
│  │  ├─ Sidebar.vue             # 侧边栏菜单
│  │  ├─ Header.vue              # 顶部导航栏
│  │  └─ index.ts                # 组件统一导出
│  │
│  ├─ views/                     # 页面组件
│  │  ├─ AgvList.vue             # AGV 车辆管理（验证页）
│  │  ├─ CapacityMonitor.vue     # 产能监控（V2）
│  │  └─ index.ts                # 页面统一导出
│  │
│  ├─ stores/                    # Pinia 状态管理
│  │  ├─ useUserStore.ts         # 用户状态（预留）
│  │  ├─ usePermissionStore.ts   # 权限状态（预留）
│  │  └─ index.ts                # Store 统一导出
│  │
│  ├─ constants/                 # 常量定义
│  │  ├─ route.ts                # 路由常量（路由键、名称等）
│  │  ├─ permission.ts           # 权限常量（预留）
│  │  └─ index.ts                # 常量统一导出
│  │
│  ├─ composables/               # 组合式函数
│  │  ├─ useSidebar.ts           # 侧边栏逻辑（预留）
│  │  └─ index.ts                # Composable 统一导出
│  │
│  ├─ types/                     # TypeScript 类型定义
│  │  ├─ router.d.ts             # 路由类型扩展
│  │  ├─ layout.d.ts             # Layout 类型扩展
│  │  └─ index.ts                # 类型统一导出
│  │
│  ├─ App.vue                    # 根组件
│  ├─ main.ts                    # 应用入口
│  └─ vite.config.ts             # Vite 配置
│
├─ __tests__/                     # 测试文件
│  ├─ layout/                    # Layout 组件测试
│  │  ├─ AdminLayout.test.ts
│  │  ├─ Sidebar.test.ts
│  │  └─ Header.test.ts
│  ├─ views/                     # 页面组件测试
│  │  └─ AgvList.test.ts
│  └─ setup.ts                   # 测试环境配置
│
├─ index.html                     # HTML 入口
├─ package.json                   # 依赖配置
└─ vite.config.ts                 # Vite 配置
```

### 2.2 目录职责说明

#### `router/` 路由配置

- **静态路由**：无需权限即可访问的页面（登录、注册、404 等）
- **动态路由**：需权限验证的页面（AGV 管理、产能监控等）
- **路由守卫**：全局前置守卫、后置守卫（认证、权限校验）

#### `layout/` 布局组件

- **AdminLayout.vue**：主布局容器（布局框架）
- **Sidebar.vue**：左侧侧边栏（导航菜单）
- **Header.vue**：顶部导航栏（面包屑 + 用户菜单）

#### `views/` 页面组件

- **AgvList.vue**：AGV 车辆管理表格页（Milestone 3 验证页）
- **CapacityMonitor.vue**：产能监控页面（预留）

---

## 📋 3. Layout 骨架设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      AdminLayout                            │
│  ┌──────────┐                                               │
│  │  Sidebar │                                               │
│  │  (Left)  │              Main Content Area                │
│  │  Fixed   │  ┌───────────────────────────────────────┐   │
│  │  240px   │  │                 Header                │   │
│  │          │  │ ┌─────────────────────────────────┐   │   │
│  │  Menu    │  │ │  Breadcrumb  │  User Dropdown  │   │   │
│  │  Items   │  │ └─────────────────────────────────┘   │   │
│  │          │  │                                         │   │
│  │          │  │         <router-view />                 │   │
│  │          │  │      (Page Content)                     │   │
│  └──────────┘  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 AdminLayout.vue 设计

####Props 接口

```typescript
// apps/admin/src/layout/AdminLayout.vue
<script setup lang="ts">
// Props（预留扩展）
interface AdminLayoutProps {
  // 是否折叠侧边栏
  collapsed?: boolean;
  // 是否显示 Header
  showHeader?: boolean;
}

const props = withDefaults(defineProps<AdminLayoutProps>(), {
  collapsed: false,
  showHeader: true,
});
</script>
```

#### 结构设计

```vue
<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="collapsed" />

    <!-- 主内容区 -->
    <div class="admin-layout__main">
      <!-- 顶栏 -->
      <Header v-if="showHeader" />

      <!-- 路由出口 -->
      <main class="admin-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-layout__content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
```

### 3.3 Sidebar.vue 设计

#### Props 接口

```typescript
interface SidebarProps {
  collapsed: boolean;
}
```

#### 菜单项定义

```typescript
// apps/admin/src/constants/route.ts
export const MAIN_ROUTES = [
  {
    path: '/agv',
    name: 'AgvList',
    meta: {
      title: 'AGV 车辆管理',
      icon: 'Position',
      order: 1,
    },
  },
  {
    path: '/capacity',
    name: 'CapacityMonitor',
    meta: {
      title: '产能监控',
      icon: 'TrendCharts',
      order: 2,
    },
  },
];
```

#### 菜单渲染

```vue
<template>
  <el-aside :width="collapsed ? '64px' : '240px'" class="sidebar">
    <div class="sidebar__logo">
      <!-- Logo 图标 -->
      <el-icon :size="32"><智慧工厂图标</el-icon>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :router="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <el-menu-item
        v-for="route in visibleRoutes"
        :key="route.path"
        :index="route.path"
      >
        <el-icon><component :is="route.meta.icon" /></el-icon>
        <template #title>{{ route.meta.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>
```

### 3.4 Header.vue 设计

#### 组成部分

1. **面包屑导航**
   - 使用 `el-breadcrumb` 组件
   - 自动从路由配置生成

2. **用户下拉菜单**
   - 用户头像
   - 退出登录按钮（预留）

#### 结构设计

```vue
<template>
  <header class="header">
    <!-- 面包屑 -->
    <el-breadcrumb class="header__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 用户菜单 -->
    <el-dropdown class="header__user">
      <span class="user__trigger">
        <el-avatar :size="32" src="https://.../avatar.png" />
        <span class="user__name">管理员</span>
        <el-icon class="user__arrow"><_arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>
```

#### 面包屑生成逻辑

```typescript
// apps/admin/src/composables/useBreadcrumb.ts
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export const useBreadcrumb = () => {
  const route = useRoute();

  const breadcrumbList = computed(() => {
    // 从 route.matched 中提取面包屑
    return route.matched.filter((item) => item.meta.title);
  });

  return {
    breadcrumbList,
  };
};
```

---

## 📋 4. 验证页面设计

### 4.1 AgvList.vue 设计

#### 页面功能

- **标题**：AGV 车辆管理
- **表格列**：ID、X 坐标、Y 坐标、状态
- **数据源**：`DataBuffer.getInstance().getSnapshot()`（来自 `@packages/shared`）
- **状态标识**：使用 `el-tag` 组件（空闲/移动中/错误）

#### Props 接口

```typescript
// AgvList.vue props
interface AgvListProps {
  // 是否显示状态筛选
  showStatusFilter?: boolean;
}

const props = withDefaults(defineProps<AgvListProps>(), {
  showStatusFilter: true,
});
```

#### 数据获取

```typescript
import { ref, onMounted } from 'vue';
import { DataBuffer } from '@packages/shared';
import type { IAgvData } from '@packages/shared';

const agvList = ref<IAgvData[]>([]);

onMounted(() => {
  // 从 DataBuffer 获取 AGV 数据快照
  const snapshot = DataBuffer.getInstance().getSnapshot();
  agvList.value = snapshot;
});
```

#### 表格列定义

```vue
<template>
  <div class="agv-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AGV 车辆管理</span>
          <el-button type="primary" size="small">刷新</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="agvList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="x" label="X 坐标" width="100" />
        <el-table-column prop="y" label="Y 坐标" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
```

#### 状态转换逻辑

```typescript
// apps/admin/src/constants/permission.ts
export const AGV_STATUS_MAP = {
  idle: { text: '空闲', type: 'success' },
  moving: { text: '移动中', type: 'primary' },
  error: { text: '错误', type: 'danger' },
};

const getStatusType = (status: string) => AGV_STATUS_MAP[status]?.type || 'info';
const getStatusText = (status: string) => AGV_STATUS_MAP[status]?.text || status;
```

### 4.2 类型引入

#### 从 `@packages/shared` 引入类型

```typescript
// apps/admin/src/views/AgvList.vue
import type { IAgvData } from '@packages/shared';
```

#### 类型定义位置

类型定义在 `@packages/shared/src/websocket/types.ts`：

```typescript
// packages/shared/src/websocket/types.ts
export interface IAgvData {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'moving' | 'error';
}
```

---

## 📋 5. 后续测试覆盖范围规划

### 5.1 红灯阶段测试用例规划

#### 5.1.1 Router 测试

**测试文件**：`apps/admin/__tests__/router/index.test.ts`

**测试覆盖**：

| 测试项 | 说明 |
|--------|------|
| `静态路由注册` | 验证路由实例包含静态路由（/agv、/capacity） |
| `动态路由注册` | 验证路由实例包含动态路由（预留） |
| `默认重定向` | 验证根路径 `/` 重定向到 `/agv` |
| `404 路由` | 验证通配符路由 `/:pathMatch(.*)*` 存在 |

#### 5.1.2 Layout 测试

**测试文件**：`apps/admin/__tests__/layout/AdminLayout.test.ts`

**测试覆盖**：

| 测试项 | 说明 |
|--------|------|
| `布局结构` | 验证 Sidebar + Main 内容区结构正确 |
| `路由出口渲染` | 验证 `<router-view />` 正确挂载子组件 |
| `侧边栏菜单` | 验证 Sidebar 渲染菜单项（AGV 车辆管理、产能监控） |
| `Header 面包屑` | 验证 Header 渲染面包屑导航 |

**测试示例**：

```typescript
// apps/admin/__tests__/layout/AdminLayout.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router';
import AdminLayout from '@/layout/AdminLayout.vue';

describe('AdminLayout', () => {
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes,
    });
  });

  it('渲染正确的布局结构', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
      },
    });

    // 验证 Sidebar 存在
    expect(wrapper.findComponent({ name: 'Sidebar' }).exists()).toBe(true);

    // 验证 Header 存在
    expect(wrapper.findComponent({ name: 'Header' }).exists()).toBe(true);

    // 验证 router-view 存在
    expect(wrapper.findComponent('router-view').exists()).toBe(true);
  });

  it('正确挂载子路由', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
      },
    });

    // 导航到 AGV 列表页
    await router.push('/agv');
    await router.isReady();

    // 验证 AgvList 组件渲染
    expect(wrapper.findComponent({ name: 'AgvList' }).exists()).toBe(true);
  });
});
```

#### 5.1.3 Views 测试

**测试文件**：`apps/admin/__tests__/views/AgvList.test.ts`

**测试覆盖**：

| 测试项 | 说明 |
|--------|------|
| `表格渲染` | 验证 el-table 渲染正确列（ID、X、Y、状态） |
| `数据绑定` | 验证表格数据从 DataBuffer 正确获取 |
| `状态标签` | 验证不同状态渲染不同颜色的 el-tag |
| `空数据渲染` | 验证无数据时显示空状态 |

**测试示例**：

```typescript
// apps/admin/__tests__/views/AgvList.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AgvList from '@/views/AgvList.vue';
import { DataBuffer } from '@packages/shared';

vi.mock('@packages/shared', () => ({
  DataBuffer: {
    getInstance: () => ({
      getSnapshot: vi.fn(),
    }),
  },
}));

describe('AgvList', () => {
  const mockData = [
    { id: 'AGV001', x: 100, y: 200, status: 'idle' },
    { id: 'AGV002', x: 150, y: 250, status: 'moving' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (DataBuffer.getInstance().getSnapshot as vi.Mock).mockReturnValue(mockData);
  });

  it('渲染表格列', () => {
    const wrapper = mount(AgvList);
    expect(wrapper.text()).toContain('ID');
    expect(wrapper.text()).toContain('X 坐标');
    expect(wrapper.text()).toContain('Y 坐标');
    expect(wrapper.text()).toContain('状态');
  });

  it('渲染表格数据', () => {
    const wrapper = mount(AgvList);
    expect(wrapper.text()).toContain('AGV001');
    expect(wrapper.text()).toContain('100');
    expect(wrapper.text()).toContain('200');
  });

  it('根据状态渲染不同颜色标签', () => {
    const wrapper = mount(AgvList);
    expect(wrapper.find('[data-status="idle"]').exists()).toBe(true);
    expect(wrapper.find('[data-status="moving"]').exists()).toBe(true);
  });
});
```

---

## 📋 6. 蓝灯阶段交付清单

### 6.1 目录结构文件

- [x] `apps/admin/src/router/index.ts` - 路由实例
- [x] `apps/admin/src/router/routes/index.ts` - 路由聚合
- [x] `apps/admin/src/router/routes/static.ts` - 静态路由
- [x] `apps/admin/src/constants/route.ts` - 路由常量
- [x] `apps/admin/src/layout/index.ts` - Layout 组件导出
- [x] `apps/admin/src/views/index.ts` - 页面组件导出
- [x] `apps/admin/src/types/index.ts` - 类型定义导出

### 6.2 核心组件文件

- [x] `apps/admin/src/App.vue` - 根组件
- [x] `apps/admin/src/main.ts` - 应用入口
- [x] `apps/admin/src/layout/AdminLayout.vue` - 主布局
- [x] `apps/admin/src/layout/Sidebar.vue` - 侧边栏
- [x] `apps/admin/src/layout/Header.vue` - 顶栏
- [x] `apps/admin/src/views/AgvList.vue` - AGV 列表页

### 6.3 配置文件

- [x] `apps/admin/package.json` - 依赖配置
- [x] `apps/admin/vite.config.ts` - Vite 配置
- [x] `apps/admin/tsconfig.json` - TypeScript 配置
- [x] `apps/admin/index.html` - HTML 入口

---

## 🎯 蓝灯验证标准

执行以下命令，确保项目能正常运行：

```bash
# 1. 安装依赖
cd apps/admin
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 验证访问 http://localhost:5174
# - 侧边栏显示菜单（AGV 车辆管理、产能监控）
# - Main 区域渲染 AgvList 组件
# - 表格显示 AGV 数据
```

---

**✅ 蓝灯阶段设计完成！**

> 以上是该需求的交互与技术设计提案，请问是否同意？（同意后我将进入红灯阶段，编写对应自动化测试用例）
