/**
 * Vue 组件类型声明
 * 文件路径：@packages/charts/src/types/vue.d.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 声明说明：
 * - 为 .vue 文件提供默认导出类型
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}
