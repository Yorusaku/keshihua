/**
 * ECharts 图表组件导出文件
 * 文件路径：@packages/charts/src/echarts/index.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 导出说明：
 * - TrendChart：时序折线图组件
 *
 * 📌 说明：
 * - 直接导入 .vue 源码文件（由 Vite 处理）
 */

// ✅ 组件导出（直接导入并导出）
import TrendChart from './TrendChart.vue';
export { TrendChart };
export default TrendChart;
