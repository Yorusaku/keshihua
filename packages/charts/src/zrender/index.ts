/**
 * AgvRenderer 导出文件
 * 文件路径：@packages/charts/src/zrender/index.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
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

// ✅ 类型导出
export type {
  AgvStatusColorMap,
  AgvRendererOptions,
  GetDataSnapshot,
  ZRenderDisplayable,
} from './types';

/// MARK: 删除 IAgvData 导入，避免循环依赖
// import type { IAgvData } from '@packages/shared';

// 📌 调用示例（生产环境）：
// import { AgvRenderer } from '@packages/charts';
// const container = document.getElementById('agv-renderer') as HTMLDivElement;
// const renderer = new AgvRenderer(container);
// renderer.startAnimationLoop(() => DataBuffer.getInstance().getSnapshot());

// ✅ 重导出 echarts 模块（TrendChart）
export * from '../echarts';
