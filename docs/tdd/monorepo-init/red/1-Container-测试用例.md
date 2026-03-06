# 红灯阶段：Container 组件测试用例详细分析

**测试文件**：`apps/web/src/components/Screen/__tests__/Container.test.ts`  
**测试用例数**：10 个  
**文件行数**：299 行

---

## 🔍 测试概览

| 编号 | 测试用例 | 预期结果 | 状态 |
|------|---------|---------|------|
| TC-021 | 当窗口宽度为 1920px 时，应该计算 scale 为 1.0 | scale === 1.0 | 🔴 |
| TC-022 | 当窗口宽度为 960px 时，应该计算 scale 为 0.5 | scale === 0.5 | 🔴 |
| TC-023 | 当窗口高度为 540px 时，应该计算 scale 为 0.5 | scale === 0.5 | 🔴 |
| TC-024 | 当窗口尺寸大于基准分辨率时，scale 不应该超过 1.0 | scale ≤ 1.0 | 🔴 |
| TC-025 | 当窗口尺寸小于最小限制时，scale 不应该小于 0.5 | scale ≥ 0.5 | 🔴 |
| TC-026 | 当窗口 resize 时，应该触发 scale 重新计算 | scale 重新计算 | 🔴 |
| TC-027 | 当组件卸载时，应该移除 resize 事件监听 | removeEventListener 调用 | 🔴 |
| TC-028 | 当窗口宽高比小于基准时，应该由高度决定 scale | scale ≈ 0.6667 | 🔴 |
| TC-029 | 当窗口宽高比大于基准时，应该由宽度决定 scale | scale ≈ 0.6667 | 🔴 |
| TC-030 | 应该正确渲染容器结构 | 容器结构存在 | 🔴 |

---

## 📊 测试用例详细分析

### TC-021 | 当窗口宽度为 1920px 时，应该计算 scale 为 1.0

#### 测试目的
验证基准分辨率下的缩放计算

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1920, 1080)

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBe(1.0)
```

#### 预期结果
- `scale` 应该等于 `1.0`
- `window.innerWidth / 1920 = 1.0`
- `window.innerHeight / 1080 = 1.0`
- `Math.min(1.0, 1.0) = 1.0`

#### 边界条件
- 基准分辨率的精确匹配
- 宽高比为 16:9

---

### TC-022 | 当窗口宽度为 960px 时，应该计算 scale 为 0.5

#### 测试目的
验证窗口缩小到基准一半时的缩放计算

#### 测试逻辑
```typescript
// 准备
mockWindowSize(960, 1080)

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBe(0.5)
```

#### 预期结果
- `scale` 应该等于 `0.5`
- `window.innerWidth / 1920 = 0.5`
- `window.innerHeight / 1080 = 1.0`
- `Math.min(0.5, 1.0) = 0.5`

#### 边界条件
- 窗口宽度为基准的一半
- 窗口高度为基准

---

### TC-023 | 当窗口高度为 540px 时，应该计算 scale 为 0.5

#### 测试目的
验证窗口高度缩小到基准一半时的缩放计算

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1920, 540)

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBe(0.5)
```

#### 预期结果
- `scale` 应该等于 `0.5`
- `window.innerWidth / 1920 = 1.0`
- `window.innerHeight / 1080 = 0.5`
- `Math.min(1.0, 0.5) = 0.5`

#### 边界条件
- 窗口宽度为基准
- 窗口高度为基准的一半

---

### TC-024 | 当窗口尺寸大于基准分辨率时，scale 不应该超过 1.0

#### 测试目的
验证缩放上限限制

#### 测试逻辑
```typescript
// 准备
mockWindowSize(3840, 2160) // 2x 基准分辨率

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBe(1.0)
expect(wrapper.vm.scale).toBeLessThanOrEqual(1.0)
```

#### 预期结果
- `scale` 应该被限制为 `1.0`
- `Math.min(2.0, 2.0) = 2.0`，但被 `Math.min(2.0, 1.0) = 1.0` 限制

#### 边界条件
- 窗口尺寸为基准的 2 倍
- 最大缩放限制为 1.0

---

### TC-025 | 当窗口尺寸小于最小限制时，scale 不应该小于 0.5

#### 测试目的
验证缩放下限限制

#### 测试逻辑
```typescript
// 准备
mockWindowSize(480, 270) // 1/4 基准分辨率

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBe(0.5)
expect(wrapper.vm.scale).toBeGreaterThanOrEqual(0.5)
```

#### 预期结果
- `scale` 应该被限制为 `0.5`
- `Math.min(0.25, 0.25) = 0.25`，但被 `Math.max(0.25, 0.5) = 0.5` 限制

#### 边界条件
- 窗口尺寸为基准的 1/4
- 最小缩放限制为 0.5

---

### TC-026 | 当窗口 resize 时，应该触发 scale 重新计算

#### 测试目的
验证 resize 事件触发缩放重新计算

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1920, 1080)
const wrapper = mount(MockContainer as any)
const initialScale = wrapper.vm.scale

// 修改尺寸
mockWindowSize(960, 540)

// 触发事件
window.dispatchEvent(new Event('resize'))

// 断言
expect(wrapper.vm.scale).toBe(0.5)
```

#### 预期结果
- resize 事件触发后，`scale` 应该重新计算
- scale 从 `1.0` 变为 `0.5`

#### 边界条件
- 事件监听器正确绑定
- 事件触发后计算逻辑执行

---

### TC-027 | 当组件卸载时，应该移除 resize 事件监听

#### 测试目的
验证组件生命周期清理

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1920, 1080)
const wrapper = mount(MockContainer as any)

// 卸载
wrapper.unmount()

// 断言
expect(window.removeEventListener).toBeCalledTimes(1)
```

#### 预期结果
- 组件卸载时，`removeEventListener` 应该被调用
- 移除的是 `resize` 事件

#### 边界条件
- onBeforeUnmount 钩子正确执行
- 事件监听器正确移除

---

### TC-028 | 当窗口宽高比小于基准时，应该由高度决定 scale

#### 测试目的
验证窄屏情况下的缩放逻辑

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1280, 720) // 16:9，高度只有基准的 2/3

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBeCloseTo(0.6667, 2)
```

#### 预期结果
- `scale` 应该由高度决定
- `Math.min(1280/1920, 720/1080) = Math.min(0.6667, 0.6667) = 0.6667`

#### 边界条件
- 窗口宽高比为 16:9
- 宽高缩放比例相同

---

### TC-029 | 当窗口宽高比大于基准时，应该由宽度决定 scale

#### 测试目的
验证宽屏情况下的缩放逻辑

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1280, 1080) // 16:9，宽度只有基准的 2/3

// 执行
const wrapper = mount(MockContainer as any)

// 断言
expect(wrapper.vm.scale).toBeCloseTo(0.6667, 2)
```

#### 预期结果
- `scale` 应该由宽度决定
- `Math.min(1280/1920, 1080/1080) = Math.min(0.6667, 1.0) = 0.6667`

#### 边界条件
- 窗口宽高比为 16:9
- 宽高缩放比例不同

---

### TC-030 | 应该正确渲染容器结构

#### 测试目的
验证容器组件的 DOM 结构

#### 测试逻辑
```typescript
// 准备
mockWindowSize(1920, 1080)

// 执行
const wrapper = mount(MockContainer as any, {
  slots: {
    default: '<div class="test-content">测试内容</div>',
  },
})

// 断言
expect(wrapper.find('.screen-container').exists()).toBe(true)
expect(wrapper.find('.screen-content').exists()).toBe(true)
expect(wrapper.find('.test-content').exists()).toBe(true)
```

#### 预期结果
- `.screen-container` 元素存在
- `.screen-content` 元素存在
- 插槽内容正确渲染

#### 边界条件
- 插槽内容正确传递
- transform 样式正确应用

---

## 🧪 Mock 策略

### 1. 窗口尺寸 Mock

```typescript
function mockWindowSize(width: number, height: number) {
  vi.spyOn(window, 'innerWidth', 'get').mockImplementation(() => width)
  vi.spyOn(window, 'innerHeight', 'get').mockImplementation(() => height)
}
```

### 2. 事件监听 Mock

```typescript
function mockWindowEvents() {
  const listeners: Record<string, EventListener> = {}
  
  vi.spyOn(window, 'addEventListener').mockImplementation((event, callback) => {
    listeners[event] = callback
  })
  
  vi.spyOn(window, 'removeEventListener').mockImplementation((event, callback) => {
    delete listeners[event]
  })
  
  return listeners
}
```

---

## 📊 测试执行统计

| 项目 | 数值 |
|------|------|
| 测试用例数 | 10 |
| Mock 数量 | 3 |
| 断言数量 | 25 |
| 行数 | 299 |

---

## 🔴 红灯状态

由于 Container 组件尚未实现，执行测试会失败：

```bash
$ pnpm test

FAIL  Container.test.ts
  ✕ 当窗口宽度为 1920px 时，应该计算 scale 为 1.0 (===)
  ✕ 当窗口宽度为 960px 时，应该计算 scale 为 0.5 (===)
  ✕ 当窗口高度为 540px 时，应该计算 scale 为 0.5 (===)
  ...
  
  ❌ 10 个测试失败
```

---

## ✅ 通过标准

Container 组件实现后，以下测试应全部通过：

1. ✅ 缩放计算逻辑正确
2. ✅ 窗口尺寸变化时 scale 重新计算
3. ✅ 组件卸载时事件监听正确移除
4. ✅ 容器结构正确渲染

---

## 📂 相关文档

- 🔵 [蓝灯设计提案 - 大屏自适应方案](../0-蓝灯设计提案.md#45-大屏自适应技术方案)
- 🔴 [红灯测试报告](0-红灯测试报告.md#container-组件测试)

---

**Container 测试版本**：v0.0.0  
**最后更新**：2026年3月6日  
**状态**：🔴 红灯（组件未实现）
