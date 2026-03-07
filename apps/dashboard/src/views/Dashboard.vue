/**
 * Dashboard.vue 主视口页面
 * 文件路径：apps/dashboard/src/views/Dashboard.vue
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 核心说明：
 * - 组装底层三大基建（Layout + ScaleBox + AgvRenderer）
 * - 实现高频数据模拟器（20Hz WebSocket 逼真模拟）
 * - 统一资源销毁机制（防止内存泄漏）
 * - 防御性编程与 Lingma 意图注释
 */

<template>
  <!-- ✅ 最外层：Layout 布局组件 -->
  <Layout>
    <!-- ✅ 内层：ScaleBox 自适应缩放容器（1920x1080 → 视口） -->
    <ScaleBox :width="1920" :height="1080">
      <!-- ✅ ZRender 挂载容器（100% 宽高） -->
      <div ref="canvasContainer" class="canvas-container"></div>

      <!-- ✅ CapacityPanel（绝对定位悬浮，左上角，z-index: 10） -->
      <CapacityPanel />
    </ScaleBox>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { AgvRenderer } from '@packages/charts';
import { DataBuffer, agvSyncBus } from '@packages/shared';
import type { IAgvData } from '@packages/shared';
import { Layout } from '@/components/layout';
import { ScaleBox } from '@/components/scalebox';
import { CapacityPanel } from '@/views/components';

// 📦 ZRender 容器 DOM 引用
const canvasContainer = ref<HTMLDivElement | null>(null);

// 📦 AgvRenderer 实例（60fps 渲染引擎）
let renderer: AgvRenderer | null = null;

// 📦 模拟器定时器 ID（清除用）
let mockTimerId: number | null = null;

// 📦 跨端同步取消订阅函数（清除用）
let unsubscribe: (() => void) | null = null;

/**
 * 🚀 启动高频数据模拟器（模拟 WebSocket 20Hz 推送）
 * @description 每 50ms 生成/更新 1000 辆 AGV 的坐标和状态
 * 
 * 📌 20Hz 推送模拟：
 * - setInterval 50ms（1000ms / 50ms = 20Hz）
 * - 模拟真实 WebSocket 高频数据推送场景
 * - 1000 辆 AGV 造成海量数据压力，验证 DataBuffer 性能
 */
const startMockWebSocket = (): void => {
  // ✅ setInterval 50ms（模拟 20Hz WebSocket 推送频率）
  mockTimerId = window.setInterval(() => {
    // ✅ 生成或更新 1000 辆 AGV 数据（模拟海量数据）
    const mockData: IAgvData[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `agv-mock-${String(i).padStart(3, '0')}`,
      x: Math.random() * 1920, // 0 ~ 1920（大屏宽度）
      y: Math.random() * 1080, // 0 ~ 1080（大屏高度）
      status: (Math.random() > 0.95 ? 'error' : Math.random() > 0.5 ? 'moving' : 'idle') as IAgvData['status'],
      timestamp: Date.now(),
    }));

    // ✅ 向 DataBuffer 推送高频数据（O(1) 读写，支持海量数据）
    DataBuffer.getInstance().pushData(mockData);
  }, 50); // 50ms = 20Hz（每秒 20 次推送）
};

/**
 * 🎨 启动渲染引擎（60fps 极限渲染）
 * @description 实例化 AgvRenderer，启动 requestAnimationFrame 循环
 */
const startRenderEngine = (): void => {
  // 🛡️ 防御性编程：检查容器存在性
  if (!canvasContainer.value) {
    console.error('Dashboard: canvasContainer 不存在');
    return;
  }

  // ✅ 实例化 AgvRenderer（传入 ZRender 挂载容器）
  renderer = new AgvRenderer(canvasContainer.value);

  // ✅ 启动渲染循环（从 DataBuffer 拉取快照）
  // 📌 数据源注入：通过 getDataSnapshot 函数注入
  // - DataBuffer.getInstance().getSnapshot() 拉取最新快照
  // - AgvRenderer 每帧从 DataBuffer 获取数据更新坐标
  renderer.startAnimationLoop(() => DataBuffer.getInstance().getSnapshot());
};

/**
 * 🧹 销毁资源（防止内存泄漏）
 * @description 依次执行：清除模拟器定时器 → 取消跨端订阅 → 销毁 AgvRenderer → 清空 DataBuffer
 *
 * 📌 防内存泄漏机制：
 * - 严格按照顺序销毁（避免依赖问题）
 * - 定时器清除（防止重复执行）
 * - ZRender 销毁（释放 Canvas 资源）
 * - DataBuffer 清空（释放内存数据）
 */
const destroyResources = (): void => {
  // ✅ 清除模拟器定时器（防止重复执行）
  if (mockTimerId !== null) {
    window.clearInterval(mockTimerId);
    mockTimerId = null;
  }

  // ✅ 取消跨端同步订阅（防止内存泄漏）
  if (unsubscribe !== null) {
    unsubscribe();
    unsubscribe = null;
  }

  // ✅ 销毁 AgvRenderer（防止内存泄漏）
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  // ✅ 清空 DataBuffer（释放内存数据）
  DataBuffer.getInstance().clear();
};

/**
 * 组件挂载（onMounted）
 * @description 依次启动：模拟器 → 渲染引擎 → 跨端同步订阅
 */
onMounted(() => {
  // ✅ 启动高频数据模拟器（20Hz WebSocket 模拟）
  startMockWebSocket();

  // ✅ 启动渲染引擎（60fps 极限渲染）
  startRenderEngine();

  // ✅ 订阅 Admin 侧广播的新车数据（跨端实时同步）
  unsubscribe = agvSyncBus.subscribeNewAgv((agv: IAgvData) => {
    DataBuffer.getInstance().pushData([agv]);
  });
});

/**
 * 组件卸载（onBeforeUnmount）
 * @description 依次销毁：模拟器 → AgvRenderer → DataBuffer
 * 
 * 🛡️ 防内存泄漏机制：
 * - onBeforeUnmount 是组件销毁的最后机会
 * - 严格按照顺序销毁（避免依赖问题）
 * - 所有资源必须清理干净
 */
onBeforeUnmount(() => {
  // ✅ 销毁所有资源（防止内存泄漏）
  destroyResources();
});
</script>

<style scoped>
/* 📌 Dashboard 样式说明：
 * - canvas-container：ZRender 挂载容器，100% 宽高铺满 ScaleBox
 */

.canvas-container {
  width: 100%;
  height: 100%;
}

</style>
