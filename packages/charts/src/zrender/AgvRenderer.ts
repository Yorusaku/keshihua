/**
 * AgvRenderer 核心渲染器类
 * 文件路径：@packages/charts/src/zrender/AgvRenderer.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 重构说明：
 * - 闭包扁平化：将 renderLoop 提升为类的私有箭头函数方法
 * - 配置剥离：stroke/strokeWidth 从 createNode 提取到 nodeConfig
 * - 离线节点回收：按帧间隔比对快照与节点池，销毁已离线 AGV 节点
 *
 * 📌 监控扩展（任务三）：
 * - WebGL 上下文丢失监听（webglcontextlost）
 * - Canvas 上下文丢失监听（canvascontextlost）
 * - 显存溢出错误上报（monitor.reportError）
 */

import type { GetDataSnapshot, ZRenderDisplayable } from './types';
import * as zrender from 'zrender';
import type { AgvRendererOptions } from './types';
import type { ZRenderType } from 'zrender';

/**
 * AGV 纯 Canvas 渲染器
 * @description 独立原生类，负责 ZRender 实例生命周期管理与渲染循环
 *
 * 🔒 关键约束（V5 规约强制执行）：
 * - 纯原生 JS 类（无 Vue 依赖）
 * - requestAnimationFrame 渲染循环
 * - 从 DataBuffer 拉取快照批量更新节点
 * - 明确的资源销毁方法（防止内存泄漏）
 * - 极致性能：使用朴素 for (let i = 0; i < len; i++) 循环（禁止 forEach）
 * - 解耦设计：通过 getDataSnapshot 注入数据源，不直接依赖 DataBuffer
 */
export class AgvRenderer {
  // 📦 ZRender 实例（接收用户传入的容器）
  private renderer: ZRenderType | null = null;

  // 📦 节点池（Map<string, ZRenderDisplayable>）
  private animations: Map<string, ZRenderDisplayable> = new Map();

  // 📦 节点状态快照（用于仅在状态变化时更新填充色）
  private nodeStatus: Map<string, 'idle' | 'moving' | 'error'> = new Map();

  // 📦 已渲染帧计数（用于按间隔触发离线节点回收）
  private frameCount: number = 0;

  // 📦 requestAnimationFrame 标识
  private animationFrameId: number = 0;

  // 📦 数据源注入函数（重构：闭包扁平化）
  private getDataSnapshot: GetDataSnapshot | null = null;

  // 📦 默认节点配置（重构：剥离硬编码样式）
  private nodeConfig = {
    radius: 20,
    stroke: '#fff',
    strokeWidth: 2,
    offlineReapIntervalFrames: 60,
    color: {
      idle: '#4CAF50',    // 空闲状态：绿色
      moving: '#2196F3',  // 运输中：蓝色
      error: '#F44336',   // 故障：红色
    },
  };

  // 📦 WebGL Context Lost 监听器（任务三：显存崩溃监控）
  private contextLostHandler: ((event: Event) => void) | null = null;

  /**
   * 绑定上下文丢失监听器（任务三：WebSocket 显存崩溃监控）
   * @description 监听 canvas 的 webglcontextlost 和 canvascontextlost 事件
   */
  private bindContextLostHandler(): void {
    if (!this.renderer) {
      return;
    }

    // ✅ 获取 ZRender 底层的 Canvas 元素
    const canvas = this.renderer.dom;

    if (canvas && canvas instanceof HTMLCanvasElement) {
      // ✅ 绑定 webglcontextlost 事件（WebGL 上下文丢失）
      this.contextLostHandler = (event: Event) => {
        // ✅ 阻止默认行为（防止彻底白屏）
        event.preventDefault();

        // ✅ 上报大屏显存崩溃错误
        console.error('[AgvRenderer] WebGL context lost detected!');

        // 注意：由于 Monitor SDK 在 @packages/monitor 中，而 @packages/charts 依赖 @packages/shared
        // 这里无法直接依赖 @packages/monitor（避免循环依赖）
        // 建议通过全局事件或回调方式上报错误（后续优化点）
        // 这里先打印日志，实际项目中可以通过全局错误上报函数
        this.reportCanvasError('WebGL context lost', {
          canvasId: canvas.id || 'unknown',
          timestamp: new Date().toISOString(),
        });
      };

      canvas.addEventListener('webglcontextlost', this.contextLostHandler);

      // ✅ 绑定 canvascontextlost 事件（Canvas 2D 上下文丢失）
      canvas.addEventListener('canvascontextlost', this.contextLostHandler);
    }
  }

  /**
   * 上报 Canvas 错误（内部方法）
   * @description 由于 @packages/charts 不能依赖 @packages/monitor（循环依赖），这里先预留
   * @param message 错误消息
   * @param metadata 元数据
   */
  private reportCanvasError(message: string, metadata: Record<string, unknown>): void {
    // 📌 TODO: [Milestone 3] 通过全局错误上报函数或事件总线上报
    // 示例：window.dispatchEvent(new CustomEvent('canvasError', { detail: { message, metadata } }));
    
    console.error('[AgvRenderer Error]', message, metadata);
  }

  /**
   * 构造函数
   * @param container HTMLDivElement 容器（用户传入）
   * @param options 配置项（可选，用于覆盖默认 nodeConfig）
   * @description 初始化 ZRender 实例，合并用户配置
   */
  constructor(container: HTMLDivElement, options?: AgvRendererOptions) {
    // ✅ 初始化 ZRender 实例（绑定到容器）
    this.renderer = zrender.init(container);

    // ✅ 合并用户配置（字段映射，避免 options 键名与内部配置不一致而失效）
    if (options) {
      this.nodeConfig = {
        ...this.nodeConfig,
        radius: options.nodeRadius ?? this.nodeConfig.radius,
        color: options.colorMap ?? this.nodeConfig.color,
        offlineReapIntervalFrames:
          options.offlineReapIntervalFrames ?? this.nodeConfig.offlineReapIntervalFrames,
      };
    }

    // ✅ 任务三：绑定上下文丢失监听器
    this.bindContextLostHandler();
  }

  /**
   * 启动渲染循环
   * @param getDataSnapshot 数据源注入函数（返回只读快照）
   * @description 开启原生 requestAnimationFrame 循环，每帧从getDataSnapshot拉取快照
   *
   * 📌 极致性能约束（V5 规约强制）：
   * - ❌ 禁止使用 forEach 遍历快照（性能问题）
   * - ✅ 必须使用 for (let i = 0; i < len; i++) 循环
   * - ❌ 禁止调用 this.renderer.render()（ZRender 自动重绘"脏"节点）
   * - ✅ 仅通过 shape.attr({ shape: { cx, cy } }) 更新坐标
   * - ✅ ZRender 自动处理下一帧重绘，无需手动调用 render()
   */
  public startAnimationLoop(getDataSnapshot: GetDataSnapshot): void {
    // ✅ 保存数据源注入函数（重构：闭包扁平化）
    this.getDataSnapshot = getDataSnapshot;

    // ✅ 启动首次循环（调用私有 renderLoop 方法）
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  /**
   * 渲染循环主体（重构：闭包扁平化为私有箭头函数方法）
   * @description 每帧执行：拉取快照 → 批量更新节点坐标
   */
  private renderLoop = (): void => {
    // 📌 从 getDataSnapshot 拉取最新快照（批量数据）
    const snapshot = this.getDataSnapshot?.() || [];

    this.frameCount += 1;

    // ✅ 遍历快照，批量更新节点坐标（朴素 for 循环，性能最优）
    const len = snapshot.length;
    for (let i = 0; i < len; i++) {
      const data = snapshot[i];
      if (!data) {
        continue;
      }

      // ✅ 从节点池查找（O(1) 查找）
      let shape = this.animations.get(data.id);

      if (!shape) {
        // ✅ 节点不存在：创建新节点（按需创建，懒加载）
        shape = this.createNode(data);
        this.animations.set(data.id, shape);
      } else if (this.nodeStatus.get(data.id) !== data.status) {
        // ✅ 节点存在且状态变化：仅更新填充色（避免每帧无谓的属性写入）
        shape.attr({
          style: {
            fill: this.nodeConfig.color[data.status],
          },
        } as zrender.CircleProps);
      }

      // ✅ 节点存在：仅更新坐标（O(1) 更新）
      // 📌 ZRender Circle 的坐标更新是修改 shape 对象下的 cx, cy
      // ✅ 注意：不调用 this.renderer.render()（ZRender 自动重绘"脏"节点）
      shape.attr({
        shape: {
          cx: data.x,
          cy: data.y,
        },
      } as zrender.CircleProps);

      this.nodeStatus.set(data.id, data.status);
    }

    // ✅ 离线节点回收：按固定帧间隔比对，避免每帧构建集合的额外开销
    const reapInterval = Math.max(1, this.nodeConfig.offlineReapIntervalFrames);
    if (this.frameCount % reapInterval === 0) {
      this.reapOfflineNodes(snapshot);
    }

    // ✅ 递归调用 requestAnimationFrame（下一帧）
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * 回收离线节点（私有方法）
   * @param snapshot 当前帧完整快照
   * @description 本帧快照中不存在的 AGV 视为已离线，从画布与节点池中一并移除，
   * 避免长时间运行后僵尸节点持续累积导致内存与重绘开销上升。
   */
  private reapOfflineNodes(snapshot: readonly { id: string }[]): void {
    if (this.animations.size === 0) {
      return;
    }

    const aliveIds = new Set<string>();
    for (let i = 0; i < snapshot.length; i++) {
      const data = snapshot[i];
      if (data) {
        aliveIds.add(data.id);
      }
    }

    for (const id of this.animations.keys()) {
      if (aliveIds.has(id)) {
        continue;
      }
      const shape = this.animations.get(id);
      if (shape) {
        this.renderer?.remove(shape);
      }
      this.animations.delete(id);
      this.nodeStatus.delete(id);
    }
  }

  /**
   * 创建新节点（私有方法）
   * @param data AGV 数据对象
   * @returns ZRenderDisplayable 实例（Circle）
   *
   * 📌 创建逻辑：
   * - 根据 AGV 状态决定节点颜色（idle=绿色, moving=蓝色, error=红色）
   * - 配置 shape（cx, cy, r）和 style（fill, stroke, strokeWidth）
   * - 构造函数 options 支持覆盖 nodeConfig
   */
  private createNode(data: { id: string; x: number; y: number; status: 'idle' | 'moving' | 'error' }): ZRenderDisplayable {
    // ✅ 根据状态决定颜色（可扩展为 icon/image）
    const color = this.nodeConfig.color[data.status];

    // ✅ 创建 ZRender 圆形节点（配置 shape 和 style）
    // 📌 构造函数 options 已合并到 this.nodeConfig，无需重复处理
    const shape = new zrender.Circle({
      shape: {
        cx: data.x,
        cy: data.y,
        r: this.nodeConfig.radius,
      },
      style: {
        fill: color,
        stroke: this.nodeConfig.stroke,
        lineWidth: this.nodeConfig.strokeWidth,
      },
    } as zrender.CircleProps);

    // ✅ 添加到 ZRender 实例
    this.renderer?.add(shape);

    return shape;
  }

  /**
   * 资源销毁（防止内存泄漏）
   * @description 注销 requestAnimationFrame，清空节点池，调用 zrender.dispose()
   *
   * 🛡️ 防御性编程：
   * - 判断 renderer 是否存在，防止重复销毁引发报错
   - 清空 animations Map，释放内存
   * - 先 cancelAnimationFrame，再 dispose renderer
   * - 移除 WebGL context lost 监听器（防止内存泄漏）
   */
  public dispose(): void {
    // 🛡️ 防御性编程：防止重复销毁
    if (!this.renderer || this.animationFrameId === 0) {
      return;
    }

    // ✅ 移除 WebGL context lost 监听器（任务三：避免内存泄漏）
    if (this.contextLostHandler) {
      const canvas = this.renderer.dom;
      if (canvas && canvas instanceof HTMLCanvasElement) {
        canvas.removeEventListener('webglcontextlost', this.contextLostHandler);
        canvas.removeEventListener('canvascontextlost', this.contextLostHandler);
      }
      this.contextLostHandler = null;
    }

    // ✅ 注销 requestAnimationFrame
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;

    // ✅ 清空数据源注入（重构：闭包扁平化清理）
    this.getDataSnapshot = null;

    // ✅ 清空节点池（释放内存）
    this.animations.clear();
    this.nodeStatus.clear();
    this.frameCount = 0;

    // ✅ 销毁 ZRender 实例
    this.renderer.dispose();
    this.renderer = null;
  }
}
