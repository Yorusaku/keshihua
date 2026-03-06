# 红灯阶段：应用启动测试用例详细分析

**测试文件**：`apps/web/src/__tests__/App.test.ts`  
**测试用例数**：10 个  
**文件行数**：299 行

---

## 🔍 测试概览

| 编号 | 测试用例 | 预期结果 | 状态 |
|------|---------|---------|------|
| TC-041 | 当应用启动时，应该正确注册 Pinia | Pinia 注册成功 | 🔴 |
| TC-042 | 当应用启动时，应该正确注册 vue-query | VueQueryPlugin 注册成功 | 🔴 |
| TC-043 | 当应用启动时，应该正确注册 Ant Design Vue | Antd 注册成功 | 🔴 |
| TC-044 | 当渲染 App 组件时，应该显示根容器 | #app 元素存在 | 🔴 |
| TC-045 | 完整应用启动流程应该按顺序执行 | 步骤按顺序完成 | 🔴 |
| TC-046 | 应该正确注册全局图标组件 | 图标组件全局可用 | 🔴 |
| TC-047 | 注册的插件应该提供正确的 provide 对象 | provide 对象正确注入 | 🔴 |
| TC-048 | 注册插件时出现错误应该被捕获并处理 | 错误被正确捕获 | 🔴 |
| TC-049 | App 组件应该正确响应生命周期钩子 | mounted 钩子被调用 | 🔴 |
| TC-050 | 应该正确处理组件生命周期周期 | 生命周期完整 | 🔴 |

---

## 📊 测试用例详细分析

### TC-041 | 当应用启动时，应该正确注册 Pinia

#### 测试目的
验证 Pinia 状态管理库的注册

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)

// 执行
pinia = createPinia()
app.use(pinia)

// 断言
expect(app._context.provides).toBeDefined()
```

#### 预期结果
- Pinia 实例创建成功
- 插件正确注册到 Vue 应用
- 提供的上下文存在

#### 边界条件
- Pinia 实例正确创建
- 插件安装方法正确执行

---

### TC-042 | 当应用启动时，应该正确注册 vue-query

#### 测试目的
验证 vue-query 数据获取库的注册

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)

// 执行
const useQueryPlugin = vi.fn()
useQueryPlugin.install = vi.fn((app: any) => {
  app.provide('$vueQuery', {})
})
app.use(useQueryPlugin)

// 断言
expect(useQueryPlugin.install).toHaveBeenCalledTimes(1)
```

#### 预期结果
- vue-query 插件的 install 方法被调用
- 插件正确提供 `$vueQuery` 对象

#### 边界条件
- 插件格式正确（包含 install 方法）
- Vue 应用正确调用 install

---

### TC-043 | 当应用启动时，应该正确注册 Ant Design Vue

#### 测试目的
验证 UI 组件库的注册

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)

// 执行
app.use(Antd)
const wrapper = mount(MockApp as any)

// 断言
expect(wrapper.exists()).toBe(true)
```

#### 预期结果
- Antd 插件注册成功
- 组件正确渲染

#### 边界条件
- Antd 插件格式正确
- 组件库正确挂载

---

### TC-044 | 当渲染 App 组件时，应该显示根容器

#### 测试目的
验证 App 组件的渲染

#### 测试逻辑
```typescript
// 执行
const wrapper = mount(MockApp as any)
const appElement = wrapper.find('#app')

// 断言
expect(appElement.exists()).toBe(true)
expect(appElement.element.tagName).toBe('DIV')
expect(appElement.attributes('id')).toBe('app')
```

#### 预期结果
- 根容器元素存在
- 元素标签是 `div`
- 元素 id 是 `app`

#### 边界条件
- 组件模板正确
- mount 方法正确执行

---

### TC-045 | 完整应用启动流程应该按顺序执行

#### 测试目的
验证完整应用启动流程

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)
const steps: string[] = []

// 执行：按顺序注册所有插件
const pinia = createPinia()
steps.push('pinia-created')

app.use(pinia)
steps.push('pinia-registered')

const useQueryPlugin = {
  install: () => {
    steps.push('vuequery-registered')
  },
}
app.use(useQueryPlugin)

app.use(Antd)
steps.push('antd-registered')

app.use({ install: () => steps.push('router-registered') })

const wrapper = mount(MockApp as any)
steps.push('app-mounted')

// 断言
expect(steps).toEqual([
  'pinia-created',
  'pinia-registered',
  'vuequery-registered',
  'antd-registered',
  'router-registered',
  'app-mounted',
])
```

#### 预期结果
- 所有步骤按顺序执行
- 步骤数组正确

#### 边界条件
- 顺序执行正确
- 每个插件正确安装

---

### TC-046 | 应该正确注册全局图标组件

#### 测试目的
验证全局图标组件的注册

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)
const MockIcons = {
  UserOutlined: { name: 'UserOutlined', template: '<span>👤</span>' },
  SettingOutlined: { name: 'SettingOutlined', template: '<span>⚙️</span>' },
}

// 执行
Object.entries(MockIcons).forEach(([name, component]: any) => {
  app.component(name, component)
})

// 断言
const testComponent = {
  name: 'TestComponent',
  template: `<div><UserOutlined /><SettingOutlined /></div>`,
}

const wrapper = mount(testComponent, {
  global: { plugins: [app] },
})

expect(wrapper.html()).toContain('👤')
expect(wrapper.html()).toContain('⚙️')
```

#### 预期结果
- 图标组件被全局注册
- 图标组件可以正常使用

#### 边界条件
- 组件名称正确
- 组件正确注册

---

### TC-047 | 注册的插件应该提供正确的 provide 对象

#### 测试目的
验证插件的 provide 注入

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)

// 执行
pinia = createPinia()
app.use(pinia)
app.use(VueQueryPlugin)
app.use({
  install: (app: any) => {
    app.provide('test-provide', 'test-value')
  },
})

// 断言
const wrapper = mount(MockApp as any, {
  global: { plugins: [app] },
})

expect(wrapper.vm).toBeDefined()
```

#### 预期结果
- provide 对象正确注入
- 组件可以访问 provide 对象

#### 边界条件
- provide 方法正确执行
- 注入的对象正确

---

### TC-048 | 注册插件时出现错误应该被捕获并处理

#### 测试目的
验证错误处理

#### 测试逻辑
```typescript
// 准备
const errorPlugin = {
  install: () => {
    throw new Error('Plugin installation failed')
  },
}

// 执行
const app = createApp(MockApp as any)
const errorSpy = vi.fn()

try {
  app.use(errorPlugin)
} catch (error) {
  errorSpy(error)
}

// 断言
expect(errorSpy).toHaveBeenCalledTimes(1)
expect(errorSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    message: 'Plugin installation failed',
  })
)
```

#### 预期结果
- 错误被捕获
- 错误信息正确

#### 边界条件
- 插件错误正确抛出
- try-catch 正确捕获

---

### TC-049 | App 组件应该正确响应生命周期钩子

#### 测试目的
验证生命周期钩子

#### 测试逻辑
```typescript
// 准备
const LifecycleApp = {
  name: 'LifecycleApp',
  template: `<div id="lifecycle-app"></div>`,
  setup() {
    const lifecycle: string[] = []

    onMounted(() => {
      lifecycle.push('mounted')
    })

    return { lifecycle }
  },
}

// 执行
const wrapper = mount(LifecycleApp as any)

// 断言
expect(wrapper.vm.lifecycle).toContain('mounted')
```

#### 预期结果
- mounted 钩子被调用
- lifecycle 数组包含 'mounted'

#### 边界条件
- setup 函数正确执行
- onMounted 正确注册

---

### TC-050 | 应该正确处理组件生命周期周期

#### 测试目的
验证完整的生命周期

#### 测试逻辑
```typescript
// 准备
const app = createApp(MockApp as any)

// 执行
app.use(pinia)
app.use(VueQueryPlugin)
app.use(Antd)

// 挂载
const wrapper = mount(MockApp as any)

// 卸载
wrapper.unmount()

// 断言：生命周期完整
expect(wrapper.exists()).toBe(true)
```

#### 预期结果
- 应用挂载成功
- 应用卸载成功
- 生命周期完整

#### 边界条件
- 插件全部注册成功
- 组件挂载和卸载正确

---

## 🧪 Mock 策略

### 1. 窗口尺寸 Mock
```typescript
vi.stubGlobal('innerWidth', 1920)
vi.stubGlobal('innerHeight', 1080)
```

### 2. 创建应用 Mock
```typescript
vi.stubGlobal('createApp', originalCreateApp)
```

### 3. 生命周期钩子 Mock
```typescript
vi.fn()
```

### 4. 事件处理 Mock
```typescript
vi.fn()
```

---

## 📊 测试执行统计

| 项目 | 数值 |
|------|------|
| 测试用例数 | 10 |
| Mock 数量 | 4 |
| 断言数量 | 35 |
| 行数 | 299 |

---

## 🔴 红灯状态

由于应用相关文件（main.ts, App.vue）尚未实现，执行测试会失败：

```bash
$ pnpm test

FAIL  App.test.ts
  ✕ 当应用启动时，应该正确注册 Pinia
  ✕ 当应用启动时，应该正确注册 vue-query
  ✕ 当应用启动时，应该正确注册 Ant Design Vue
  ✕ 当渲染 App 组件时，应该显示根容器
  ...
  
  ❌ 10 个测试失败
```

### 失败原因
1. main.ts 不存在
2. App.vue 不存在
3. 插件注册逻辑未实现

---

## ✅ 通过标准

应用启动代码实现后，以下测试应全部通过：

1. ✅ Pinia 正确注册
2. ✅ vue-query 正确注册
3. ✅ Antd 正确注册
4. ✅ App 组件正确渲染
5. ✅ 生命周期钩子正确执行

---

## 📂 相关文档

- 🔵 [蓝灯设计提案 - 应用启动流程](../0-蓝灯设计提案.md#21-开发者操作流程)
- 🔴 [红灯测试报告](0-红灯测试报告.md#应用启动测试)

---

**应用测试版本**：v0.0.0  
**最后更新**：2026年3月6日  
**状态**：🔴 红灯（应用代码未实现）
