/**
 * DataBuffer 核心缓冲池类
 * 文件路径：@packages/shared/src/websocket/DataBuffer.ts
 * 阶段：🟣 重构阶段（架构师级打磨）
 *
 * 📌 重构说明：
 * - 单例模式重构：私有构造函数 + 静态 getInstance()
 * - 外部闭包变量移除：instance 移入类内部
 * - 类型安全强化：彻底杜绝外部通过 new DataBuffer() 绕过单例
 */

import { IAgvData, ReadonlyAgvSnapshot } from './types';

/**
 * AGV 高频数据缓冲池
 * @description 用于极速存储与读取 WebSocket 高频数据
 * 为 60fps 极限渲染提供毫秒级数据缓存能力
 *
 * 🔒 单例模式：私有构造函数，仅能通过 DataBuffer.getInstance() 获取实例
 */
export class DataBuffer {
  // 📦 核心存储结构：Map（O(1) 读写，支持任意类型键）
  private bufferMap: Map<string, IAgvData> = new Map();

  // 🌐 静态单例实例（类内部，外部无法直接访问）
  private static instance: DataBuffer | null = null;

  /**
   * 私有构造函数（单例模式核心）
   * @description 防止外部通过 new DataBuffer() 绕过单例
   */
  private constructor() {
    // 📌 私有构造函数：仅类内部可调用
  }

  /**
   * 获取 DataBuffer 单例实例（推荐使用）
   * @returns DataBuffer 实例
   * @description 首次调用时自动初始化，此后返回同一实例
   */
  public static getInstance(): DataBuffer {
    // 🎯 懒汉单例：仅在首次调用时初始化（性能优化）
    if (!this.instance) {
      this.instance = new DataBuffer();
    }
    return this.instance;
  }

  /**
   * 向缓冲池注入最新 AGV 数据（批量或单条）
   * @param data 单条或批量 AGV 数据
   * @description O(1) 时间复杂度，直接覆写 Map 中已存在的 key
   *
   * 🛡️ 防御性编程：空值拦截（如果传入的 data 为空，直接 return）
   */
  pushData(data: IAgvData | IAgvData[]): void {
    // 🛡️ 防御性编程：空值拦截（轻量级检查，避免无效写入）
    if (!data) {
      return;
    }

    // ✅ 批量注入：使用最朴素的 for 循环（比 forEach 更快）
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const current = data[i];
        if (!current) {
          continue;
        }
        this.bufferMap.set(current.id, current);
      }
    } else {
      // ✅ 单条注入：直接 set
      this.bufferMap.set(data.id, data);
    }
  }

  /**
   * 获取缓冲池快照（用于渲染层读取）
   * @returns 浅拷贝的数组（外部修改不影响原缓冲池）
   * @description 配合 ReadonlyAgvSnapshot 类型，确保外部无法修改对象属性
   *
   * 📌 性能考量：在 60fps 渲染下，仅做数组浅拷贝以避免 GC 停顿，对象内部不可变性由 TS Readonly 静态约束保障。
   * - Array.from(map.values())：仅创建新数组（O(n) 复杂度）
   * - 不深拷贝对象：避免每帧 10 万次深拷贝引发的 GC 停顿（卡顿）
   */
  getSnapshot(): ReadonlyAgvSnapshot {
    // ✅ 浅拷贝：返回数组自身的浅拷贝（Array.from）
    // 🚫 禁止：暴力深拷贝（如 map(item => ({ ...item }))），会导致 GC 停顿
    return Array.from(this.bufferMap.values());
  }

  /**
   * 清空缓冲池（用于重置/错误恢复）
   * @description 释放内存，重置所有 AGV 状态
   */
  clear(): void {
    this.bufferMap.clear();
  }

  /**
   * 重置 DataBuffer 单例（用于测试场景）
   * @description 清空缓冲池并重置实例引用（避免测试污染）
   */
  public static resetInstance(): void {
    this.instance = null;
  }
}
