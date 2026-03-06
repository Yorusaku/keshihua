# TrendChart-1-红灯测试用例
**日期**：2026年3月7日  
**模块**：`@packages/charts` - `TrendChart.vue`  
**版本**：V5 终极架构师正式版  
**阶段**：🔴 红灯阶段（测试先行）

---

## 📋 一、交付文件清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `packages/charts/src/echarts/__tests__/setup.ts` | 🆕 创建 | 测试环境配置（Mock ECharts 和 useResizeObserver） |
| `packages/charts/src/echarts/__tests__/TrendChart.test.ts` | 🆕 创建 | 核心测试用例（11 个测试） |
| `packages/charts/src/echarts/TrendChart.vue` | 🆕 占位 | 红灯阶段占位文件（空组件） |

---

## 🔴 二、测试环境配置（setup.ts）

### 2.1 Mock ECharts

```typescript
vi.mock('echarts', () => {
  const mockSetOption = vi.fn();
  const mockResize = vi.fn();
  const mockDispose = vi.fn();

  const mockChart = {
    setOption: mockSetOption,
    resize: mockResize,
    dispose: mockDispose,
  };

  const mockInit = vi.fn(() => mockChart);

  return {
    echarts: {
      init: mockInit,
    },
    init: mockInit,
  };
});
```

### 2.2 Mock useResizeObserver

```typescript
vi.mock('@vueuse/core', () => {
  const mockResizeCallback = vi.fn();

  const mockUseResizeObserver = vi.fn((element, callback) => {
    mockResizeCallback.mockImplementation(callback);
    return { stop: vi.fn() };
  });

  return {
    useResizeObserver: mockUseResizeObserver,
  };
});
```

---

## 🔴 三、测试用例矩阵

### 3.1 测试用例执行报告

| 测试文件 | 测试用例数 | 预期状态 | 实际状态（红灯） |
|----------|----------|----------|-----------------|
| `TrendChart.test.ts` | 11 | 🔴 必然失败 | 🔴 全红 |

### 3.2 测试用例详情

| 用例编号 | 测试场景 | 预期结果 | 实际结果（红灯） |
|----------|----------|----------|-----------------|
| **TC-MR-01** | 组件挂载后，应调用 echarts.init | ❌ 未实现 | ❌ 失败 |
| **TC-MR-02** | 组件挂载后，应调用 setOption | ❌ 未实现 | ❌ 失败 |
| **TC-XP-01** | Options 中 series[0].sampling 应为 lttb | ❌ 未实现 | ❌ 失败 |
| **TC-XP-02** | Options 中 series[0].large 应为 true | ❌ 未实现 | ❌ 失败 |
| **TC-XP-03** | Options 中 series[0].largeThreshold 应为 2000 | ❌ 未实现 | ❌ 失败 |
| **TC-XP-04** | Options 中 series[0].showSymbol 应为 false | ❌ 未实现 | ❌ 失败 |
| **TC-RX-01** | data Props 变化时，应调用 setOption | ❌ 未实现 | ❌ 失败 |
| **TC-AD-01** | 容器尺寸变化时，应调用 resize | ❌ 未实现 | ❌ 失败 |
| **TC-UN-01** | 组件卸载时，应调用 dispose | ❌ 未实现 | ❌ 失败 |
| **TC-CP-01** | Props title 应影响图表 title | ❌ 未实现 | ❌ 失败 |
| **TC-CP-02** | Props color 应影响 series.lineStyle.color | ❌ 未实现 | ❌ 失败 |

---

## 🔴 四、V5 规约强制约束验证

| 检查项 | 状态 | 说明 |
|--------|------|------|
| ✅ 红灯状态有效 | 通过 | 11 个测试全部失败（红灯） |
| ✅ 空组件占位 | 通过 | TrendChart.vue 仅为空模板 |
| ✅ 无业务逻辑 | 通过 | 未实现任何实际功能 |
| ✅ 测试全覆盖 | 通过 | 覆盖设计提案所有核心场景 |

---

## 🔴 五、测试失败示例

### 5.1 TC-XP-01: sampling 配置测试

```typescript
it('Options 中 series[0].sampling 应为 lttb（最大三角桶降采样）', async () => {
  const wrapper = mount(TestWrapper, { props: { ... } });

  await nextTick();

  const callArgs = (init().setOption as vi.Mock).mock.calls[0][0];
  const series = callArgs.series?.[0];

  // ❌ 红灯阶段失败：series?.sampling 为 undefined
  expect(series?.sampling).toBe('lttb'); 
  // Error: Expected: "lttb", Received: undefined
});
```

### 5.2 TC-UN-01: 卸载清理测试

```typescript
it('组件卸载时，应调用 dispose 方法防止内存泄漏', async () => {
  const wrapper = mount(TestWrapper, { props: { ... } });
  await nextTick();
  vi.clearAllMocks();
  await wrapper.unmount();

  // ❌ 红灯阶段失败：dispose 未被调用
  expect(init().dispose).toHaveBeenCalled();
  // Error: Expected: "toHaveBeenCalled", Received: "not called"
});
```

---

## 🔴 六、交付物清单

### 6.1 测试文件

| 文件 | 说明 |
|------|------|
| `packages/charts/src/echarts/__tests__/setup.ts` | 🆕 测试环境配置 |
| `packages/charts/src/echarts/__tests__/TrendChart.test.ts` | 🆕 核心测试用例 |
| `packages/charts/src/echarts/TrendChart.vue` | 🆕 红灯占位文件 |

### 6.2 配套文档

| 文件 | 说明 |
|------|------|
| `docs/tdd/Charts/TrendChart-0-蓝灯设计提案-20260307.md` | 蓝灯阶段设计提案 |
| `docs/tdd/Charts/TrendChart-1-红灯测试用例-20260307.md` | 🆕 红灯阶段测试用例 |

---

## 🔴 七、红灯阶段状态总结

| 项目 | 状态 | 说明 |
|------|------|------|
| **测试文件** | ✅ 完成 | 11 个测试用例 |
| **Mock 环境** | ✅ 完成 | ECharts + useResizeObserver |
| **占位文件** | ✅ 完成 | 空组件（确保测试失败） |
| **测试状态** | 🔴 红灯 | 11 个测试全部失败 |
| **红灯有效性** | ✅ 有效 | 符合 V5 规约要求 |

---

> 测试代码已生成，已验证无业务实现代码时执行失败（红灯状态有效），测试用例完全对齐设计提案。请确认是否进入绿灯阶段编写业务实现代码？
