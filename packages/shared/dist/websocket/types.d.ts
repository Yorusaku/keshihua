/**
 * DataBuffer 类型定义文件
 * 文件路径：@packages/shared/src/websocket/types.ts
 * 阶段：🔴 红灯阶段（测试先行）
 *
 * 📌 类型设计说明：
 * - IAgvData：AGV 小车数据对象接口
 * - ReadonlyAgvSnapshot：只读快照类型（用于编译时约束）
 * - 注意：本文件为实际类型定义，后续绿灯阶段 DataBuffer.ts 将引用这些类型
 */
/**
 * AGV 小车数据对象接口
 * @description 用于高频 WebSocket 数据的极速存储与读取
 */
export interface IAgvData {
    /**
     * AGV 小车唯一标识符
     * - 格式：`agv-{line}-{number}`（如：`agv-line1-001`）
     * - 用途：作为 Map 的键，实现 O(1) 查找
     */
    id: string;
    /**
     * AGV 在大屏上的 X 坐标（像素）
     * - 范围：0 ~ 1920（根据 ScaleBox 宽度动态映射）
     * - 精度：最多保留 2 位小数（如 1234.56）
     */
    x: number;
    /**
     * AGV 在大屏上的 Y 坐标（像素）
     * - 范围：0 ~ 1080（根据 ScaleBox 高度动态映射）
     * - 精度：最多保留 2 位小数（如 890.12）
     */
    y: number;
    /**
     * AGV 当前运行状态
     * - 'idle'：空闲等待
     * - 'moving'：运输中
     * - 'error'：故障/异常
     */
    status: 'idle' | 'moving' | 'error';
    /**
     * 数据时间戳（毫秒）
     * - 来源：WebSocket 接收时的 `Date.now()`
     * - 用途：监控数据新鲜度，识别 stale 数据
     */
    timestamp: number;
}
/**
 * 只读 AGV 数据快照类型
 * @description 用于编译时约束：外部代码无法修改快照数组及其内部对象属性
 *
 * 📌 使用方式：
 * ```typescript
 * const snapshot: ReadonlyAgvSnapshot = buffer.getSnapshot();
 * snapshot[0].x = 999; // ❌ TypeScript 编译错误：Cannot assign to 'x' because it is a read-only property
 * ```
 */
export type ReadonlyAgvSnapshot = ReadonlyArray<Readonly<IAgvData>>;
//# sourceMappingURL=types.d.ts.map