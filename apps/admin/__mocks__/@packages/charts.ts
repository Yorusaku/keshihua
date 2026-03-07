/**
 * Mock @packages/charts
 * 阶段：🟣 重构阶段（TrendChart 组件拦截）
 */

import { defineComponent, ref } from 'vue';

/**
 * 📦 Mock TrendChart 组件（完整 Vue 组件）
 */
export const TrendChart = defineComponent({
  name: 'TrendChart',
  props: {
    data: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    color: { type: String, default: '#3B82B6' },
    lineWidth: { type: Number, default: 2 },
  },
  template: '<div class="mock-trend-chart">TrendChart Component</div>',
});

/**
 * 📦 默认导出
 */
export default TrendChart;
