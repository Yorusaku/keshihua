/**
 * AgvRenderer 核心渲染器类
 * 文件路径：@packages/charts/src/zrender/AgvRenderer.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 重构说明：
 * - 闭包扁平化：将 renderLoop 提升为类的私有箭头函数方法
 * - 配置剥离：stroke/strokeWidth 从 createNode 提取到 nodeConfig
 * - TODO 注释：僵尸节点回收预埋（Milestone 2）
 */
import type { GetDataSnapshot } from './types';
import type { AgvRendererOptions } from './types';
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
export declare class AgvRenderer {
    private renderer;
    private animations;
    private animationFrameId;
    private getDataSnapshot;
    private nodeConfig;
    /**
     * 构造函数
     * @param container HTMLDivElement 容器（用户传入）
     * @param options 配置项（可选，用于覆盖默认 nodeConfig）
     * @description 初始化 ZRender 实例，合并用户配置
     */
    constructor(container: HTMLDivElement, options?: AgvRendererOptions);
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
    startAnimationLoop(getDataSnapshot: GetDataSnapshot): void;
    /**
     * 渲染循环主体（重构：闭包扁平化为私有箭头函数方法）
     * @description 每帧执行：拉取快照 → 批量更新节点坐标
     */
    private renderLoop;
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
    private createNode;
    /**
     * 资源销毁（防止内存泄漏）
     * @description 注销 requestAnimationFrame，清空节点池，调用 zrender.dispose()
     *
     * 🛡️ 防御性编程：
     * - 判断 renderer 是否存在，防止重复销毁引发报错
     - 清空 animations Map，释放内存
     * - 先 cancelAnimationFrame，再 dispose renderer
     */
    dispose(): void;
}
//# sourceMappingURL=AgvRenderer.d.ts.map