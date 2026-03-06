/**
 * AgvRenderer 导出文件
 * 文件路径：@packages/charts/src/zrender/index.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 导出说明：
 * - AgvRenderer：核心渲染器类
 * - GetDataSnapshot：数据源注入函数类型
 * - ZRenderDisplayable：ZRender 节点类型别名
 * - AgvStatusColorMap：状态颜色映射
 * - AgvRendererOptions：渲染器配置接口
 */
// ✅ 核心类与方法导出
export { AgvRenderer } from './AgvRenderer';
// 📌 调用示例（生产环境）：
// import { AgvRenderer } from '@packages/charts';
// const container = document.getElementById('agv-renderer') as HTMLDivElement;
// const renderer = new AgvRenderer(container);
// renderer.startAnimationLoop(() => DataBuffer.getInstance().getSnapshot());
//# sourceMappingURL=index.js.map