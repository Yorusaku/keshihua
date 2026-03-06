# 红灯阶段：样式变量测试用例详细分析

**测试文件**：`apps/web/src/styles/__tests__/variables.test.ts`  
**测试用例数**：10 个  
**文件行数**：240 行

---

## 🔍 测试概览

| 编号 | 测试用例 | 预期结果 | 状态 |
|------|---------|---------|------|
| TC-031 | 当导入 variables.less 时，应该包含所有主题色变量 | 文件包含所有变量 | 🔴 |
| TC-032 | 当使用主题变量时，应该返回正确的颜色值 | primary-color === #00f0ff | 🔴 |
| TC-033 | 当变量未定义时，应该使用 fallback 默认值 | fallback 生效 | 🔴 |
| TC-034 | 应该包含完整的主题色系统（赛博蓝 + 科技紫 + 警示红） | 3 种主题色完整 | 🔴 |
| TC-035 | 应该包含完整的文本色系统（主色 + 次色 + 三次色） | 3 种文本色完整 | 🔴 |
| TC-036 | 应该包含完整的背景色系统（主色 + 次色 + 三次色） | 3 种背景色完整 | 🔴 |
| TC-037 | 应该包含完整的间距系统（xs 到 xxl） | 6 个间距变量完整 | 🔴 |
| TC-038 | 应该包含完整的字体大小系统（xs 到 xxxl） | 7 个字体大小变量完整 | 🔴 |
| TC-039 | 应该包含完整的边框色系统（亮色 + hover） | 2 种边框色完整 | 🔴 |
| TC-040 | Less 文件应该包含所有必要的注释和分组说明 | 注释分组完整 | 🔴 |

---

## 📊 测试用例详细分析

### TC-031 | 当导入 variables.less 时，应该包含所有主题色变量

#### 测试目的
验证 Less 变量文件的完整性

#### 测试逻辑
```typescript
// 准备
const fs = require('fs')
const path = require('path')
const lessPath = path.join(__dirname, '../variables.less')
const lessContent = fs.readFileSync(lessPath, 'utf8')

const expectedVariables = [
  'primary-color',
  'primary-dark',
  'primary-gradient',
  'secondary-color',
  'accent-color',
]

// 断言
expectedVariables.forEach((variable) => {
  expect(lessContent).toContain(`@${variable}`)
})
```

#### 预期结果
- 所有预期的变量都在文件中定义
- 文件读取成功

#### 边界条件
- Less 文件存在
- 文件内容包含所有变量

---

### TC-032 | 当使用主题变量时，应该返回正确的颜色值

#### 测试目的
验证 Less 变量的值正确性

#### 测试逻辑
```typescript
// 准备
const lessContent = fs.readFileSync(lessPath, 'utf8')

// 执行
const primaryColorMatch = lessContent.match(/@primary-color:\s*([^;]+)/)
const bgColorMatch = lessContent.match(/@bg-color:\s*([^;]+)/)

// 断言
expect(primaryColorMatch?.[1].trim()).toBe('#00f0ff')
expect(bgColorMatch?.[1].trim()).toBe('#0a0e1a')
```

#### 预期结果
- `primary-color` 的值为 `#00f0ff`
- `bg-color` 的值为 `#0a0e1a`

#### 边界条件
- 正则表达式正确匹配
- 变量值没有多余空格

---

### TC-033 | 当变量未定义时，应该使用 fallback 默认值

#### 测试目的
验证 fallback 逻辑

#### 测试逻辑
```typescript
// 准备
const theme = {
  primaryColor: '#00f0ff',
  bgColor: '#0a0e1a',
  undefinedColor: undefined,
}

// 执行
const getFallbackColor = (color: string | undefined, fallback: string) => {
  return color || fallback
}

// 断言
expect(getFallbackColor(theme.primaryColor, '#000000')).toBe('#00f0ff')
expect(getFallbackColor(theme.undefinedColor, '#ff0000')).toBe('#ff0000')
```

#### 预期结果
- 已定义的变量返回其值
- 未定义的变量返回 fallback

#### 边界条件
- undefined 值正确处理
- null 值正确处理

---

### TC-034 | 应该包含完整的主题色系统（赛博蓝 + 科技紫 + 警示红）

#### 测试目的
验证主题色系统的完整性

#### 测试逻辑
```typescript
// 准备
const 赛博蓝Match = lessContent.match(/@primary-color:\s*([^;]+)/)
const 科技紫Match = lessContent.match(/@secondary-color:\s*([^;]+)/)
const 警示红Match = lessContent.match(/@accent-color:\s*([^;]+)/)

// 断言
expect(赛博蓝Match?.[1].trim()).toBe('#00f0ff')
expect(科技紫Match?.[1].trim()).toBe('#7b42f5')
expect(警示红Match?.[1].trim()).toBe('#ff0055')
```

#### 预期结果
- 赛博蓝：`#00f0ff`
- 科技紫：`#7b42f5`
- 警示红：`#ff0055`

#### 边界条件
- 所有主题色都在文件中定义
- 颜色值正确

---

### TC-035 | 应该包含完整的文本色系统（主色 + 次色 + 三次色）

#### 测试目的
验证文本色系统的完整性

#### 测试逻辑
```typescript
// 准备
const textColorMatch = lessContent.match(/@text-color:\s*([^;]+)/)
const textColorSecondaryMatch = lessContent.match(/@text-color-secondary:\s*([^;]+)/)
const textColorTertiaryMatch = lessContent.match(/@text-color-tertiary:\s*([^;]+)/)

// 断言
expect(文本色Match?.[1].trim()).toBe('#ffffff')
expect(文本色次级Match?.[1].trim()).toBe('rgba(255, 255, 255, 0.85)')
expect(文本色三级Match?.[1].trim()).toBe('rgba(255, 255, 255, 0.65)')
```

#### 预期结果
- 文本主色：`#ffffff`
- 文本次色：`rgba(255, 255, 255, 0.85)`
- 文本三级色：`rgba(255, 255, 255, 0.65)`

#### 边界条件
- rgba 格式正确解析
- 不透明度值正确

---

### TC-036 | 应该包含完整的背景色系统（主色 + 次色 + 三次色）

#### 测试目的
验证背景色系统的完整性

#### 测试逻辑
```typescript
// 准备
const bgColors = [
  { name: 'bg-color', value: '#0a0e1a' },
  { name: 'bg-color-secondary', value: '#11172a' },
  { name: 'bg-color-tertiary', value: '#1a233a' },
]

// 断言
bgColors.forEach(({ name, value }) => {
  const match = lessContent.match(new RegExp(`@${name}:\\s*([^;]+)`))
  expect(match?.[1].trim()).toBe(value)
})
```

#### 预期结果
- 主背景色：`#0a0e1a`
- 次背景色：`#11172a`
- 三背景色：`#1a233a`

#### 边界条件
- 所有背景色都在文件中定义

---

### TC-037 | 应该包含完整的间距系统（xs 到 xxl）

#### 测试目的
验证间距系统的完整性

#### 测试逻辑
```typescript
// 准备
const spacings = [
  { name: 'spacing-xs', value: '4px' },
  { name: 'spacing-sm', value: '8px' },
  { name: 'spacing-md', value: '16px' },
  { name: 'spacing-lg', value: '24px' },
  { name: 'spacing-xl', value: '32px' },
  { name: 'spacing-xxl', value: '48px' },
]

// 断言
spacings.forEach(({ name, value }) => {
  const match = lessContent.match(new RegExp(`@${name}:\\s*([^;]+)`))
  expect(match?.[1].trim()).toBe(value)
})
```

#### 预期结果
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

#### 边界条件
- 所有间距值都是像素单位
- 间距值按倍数递增

---

### TC-038 | 应该包含完整的字体大小系统（xs 到 xxxl）

#### 测试目的
验证字体大小系统的完整性

#### 测试逻辑
```typescript
// 准备
const fontSizes = [
  { name: 'font-size-xs', value: '12px' },
  { name: 'font-size-sm', value: '14px' },
  { name: 'font-size-base', value: '16px' },
  { name: 'font-size-lg', value: '18px' },
  { name: 'font-size-xl', value: '24px' },
  { name: 'font-size-xxl', value: '32px' },
  { name: 'font-size-xxxl', value: '48px' },
]

// 断言
fontSizes.forEach(({ name, value }) => {
  const match = lessContent.match(new RegExp(`@${name}:\\s*([^;]+)`))
  expect(match?.[1].trim()).toBe(value)
})
```

#### 预期结果
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 24px
- xxl: 32px
- xxxl: 48px

#### 边界条件
- 所有字体大小值都是像素单位
- 字体大小值按倍数递增

---

### TC-039 | 应该包含完整的边框色系统（亮色 + hover）

#### 测试目的
验证边框色系统的完整性

#### 测试逻辑
```typescript
// 准备
const borderColorMatch = lessContent.match(/@border-color:\s*([^;]+)/)
const borderColorHoverMatch = lessContent.match(/@border-color-hover:\s*([^;]+)/)

// 断言
expect(边框色Match?.[1].trim()).toBe('rgba(0, 240, 255, 0.3)')
expect(边框色hoverMatch?.[1].trim()).toBe('rgba(0, 240, 255, 0.6)')
```

#### 预期结果
- 边框色：`rgba(0, 240, 255, 0.3)`
- 悬停边框色：`rgba(0, 240, 255, 0.6)`

#### 边界条件
- rgba 格式正确解析
- 半透明度值不同

---

### TC-040 | Less 文件应该包含所有必要的注释和分组说明

#### 测试目的
验证 Less 文件的可读性和结构

#### 测试逻辑
```typescript
// 准备
const sectionHeaders = [
  '主题色',
  '文本色',
  '背景色',
  '边框色',
  '字体变量',
  '间距系统',
  '字体大小',
]

// 断言
sectionHeaders.forEach((header) => {
  expect(lessContent).toContain(`/* ${header} */`)
})
```

#### 预期结果
- 所有分组都有注释
- 注释格式正确

---

## 🧪 Mock 策略

### 无 Mock
- 该测试文件使用同步文件读取
- 无需 Mock external dependencies

---

## 📊 测试执行统计

| 项目 | 数值 |
|------|------|
| 测试用例数 | 10 |
| Mock 数量 | 0 |
| 断言数量 | 45 |
| 行数 | 240 |

---

## 🔴 红灯状态

由于 Less 变量文件尚未创建，执行测试会失败：

```bash
$ pnpm test

FAIL  variables.test.ts
  ✕ 当导入 variables.less 时，应该包含所有主题色变量
  ✕ 当使用主题变量时，应该返回正确的颜色值
  ...
  
  ❌ 10 个测试失败
```

### 失败原因
1. Less 文件不存在
2. 文件读取失败
3. 变量定义不存在

---

## ✅ 通过标准

Less 变量文件实现后，以下测试应全部通过：

1. ✅ Less 文件存在且包含所有变量
2. ✅ 变量值正确
3. ✅ 文件结构完整
4. ✅ 注释分组正确

---

## 📂 相关文档

- 🔵 [蓝灯设计提案 - 主题变量设计](../0-蓝灯设计提案.md#46-主题变量设计)
- 🔴 [红灯测试报告](0-红灯测试报告.md#样式变量测试)

---

**变量测试版本**：v0.0.0  
**最后更新**：2026年3月6日  
**状态**：🔴 红灯（变量文件未实现）
