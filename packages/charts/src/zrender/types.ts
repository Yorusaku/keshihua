/**
 * AgvRenderer 类型定义文件
 * 文件路径：@packages/charts/src/zrender/types.ts
 * 阶段：🔴 红灯阶段（测试先行）
 * 
 * 📌 类型设计说明：
 * - AgvStatusColorMap：状态到颜色的映射
 * - AgvRendererOptions：渲染器配置接口
 * - GetDataSnapshot：数据源注入函数类型
 */

import type { Displayable } from 'zrender';
import type { IAgvData } from '@packages/shared';

/**
 * AGV 状态颜色映射
 * @description 用于根据 AGV 状态动态设置节点颜色
 */
export type AgvStatusColorMap = {
  idle: string;   // 空闲状态（绿色）
  moving: string; // 运输中（蓝色）
  error: string;  // 故障/异常（红色）
};

/**
 * AgvRenderer 配置接口（预留扩展）
 */
export interface AgvRendererOptions {
  /**
   * 节点半径（像素）
   * - 默认：20
   */
  nodeRadius?: number;

  /**
   * 节点颜色映射
   * - 默认：idle=绿色, moving=蓝色, error=红色
   */
  colorMap?: AgvStatusColorMap;
}

/**
 * 只读 AGV 快照类型
 */
export type ReadonlyAgvSnapshot = readonly IAgvData[];

/**
 * 数据源注入函数类型
 * @description AgvRenderer 不直接依赖 DataBuffer，通过此函数注入数据源
 * @returns ReadonlyAgvSnapshot 只读快照数组
 */
export type GetDataSnapshot = () => ReadonlyAgvSnapshot;

/**
 * ZRender Displayable 节点类型别名
 * @description 用于引用 ZRender 的 Displayable 类型
 */
export type ZRenderDisplayable = Displayable;
