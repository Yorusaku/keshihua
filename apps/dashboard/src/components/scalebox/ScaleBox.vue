<template>
  <div ref="containerRef" class="scalebox-wrapper">
    <div class="scalebox-content" :style="scaleStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useElementSize } from '@vueuse/core';
import { calculateScale } from './helpers';
import { DEFAULT_DESIGN_WIDTH, DEFAULT_DESIGN_HEIGHT } from './constants';

// 📦 Props 定义（TypeScript 洁癖：显式接口定义，禁止隐式 any）
interface ScaleBoxProps {
  width?: number;
  height?: number;
}

// 🔄 首屏动画优化：初始不加 transition，避免首屏缩放抖动
// 只有在 ResizeObserver 触发尺寸变化时，才开启 transition
const props = withDefaults(defineProps<ScaleBoxProps>(), {
  width: DEFAULT_DESIGN_WIDTH,
  height: DEFAULT_DESIGN_HEIGHT,
});

// 📌 是否已首次挂载完成（用于控制 transition 开关）
let isFirstMount = true;

// 🎯 核心逻辑：监听容器尺寸变化（useElementSize 自动处理 ResizeObserver）
const containerRef = ref<HTMLElement | null>(null);

// 📏 获取容器实际宽高（响应式，自动更新）
// ✅ useElementSize 接受 ref 作为第一个参数，初始值可以为 null
// - Vue 会在组件挂载时自动将 ref 关联到 DOM 元素
// - useElementSize 会在 onMounted 后开始监听尺寸变化
const { width: containerWidth, height: containerHeight } = useElementSize(
  containerRef!,
  { width: 1920, height: 1080 },
  {
    // 🤔 为什么要监听 ResizeObserver？
    // - Vitepress/VueUse 内置的 ResizeObserver polyfill 兼容性好
    // - 比 window.resize 事件更精准，只在元素尺寸变化时触发
    // - 自动处理元素显示/隐藏状态，避免无用计算
  }
);

// 🧮 计算缩放比例（调用纯函数 helpers，确保逻辑分离）
const scale = computed(() => {
  // 🛡️ 防御性编程：当 containerRef 尚未挂载时，使用 window 尺寸作为兜底
  // ✅ 类型收窄：处理 null 情况
  const cw = typeof containerWidth.value === 'number' ? containerWidth.value : window.innerWidth;
  const ch = typeof containerHeight.value === 'number' ? containerHeight.value : window.innerHeight;

  // ✅ 调用纯函数计算缩放比例（逻辑复用 + 易测试）
  return calculateScale(cw, ch, props.width, props.height);
});

// 🎨 样式对象（符合视图层极简主义：只负责绑定，不包含计算）
const scaleStyle = computed(() => {
  // 🔄 首屏动画优化：首次挂载不加 transition，避免缩放抖动
  // 只有在 ResizeObserver 触发尺寸变化时，才开启 transition
  const hasTransition = !isFirstMount && containerRef.value !== null;
  
  return {
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center',
    width: `${props.width}px`,
    height: `${props.height}px`,
    // 📌 动态 transition：仅在非首次挂载时启用
    transition: hasTransition ? 'transform 0.3s ease-out' : 'none',
  };
});

// 🏁 首屏挂载完成标记（在 nextTick 后设置，确保首次渲染不带动画）
onMounted(() => {
  // 📌 使用 requestAnimationFrame 延迟标记，确保首次渲染结束
  requestAnimationFrame(() => {
    isFirstMount = false;
  });
});

// 🧹 清理（防止内存泄漏）
onBeforeUnmount(() => {
  isFirstMount = true;
});
</script>

<style scoped>
/* 📌 ScaleBox 样式说明：
 * - wrapper：全屏容器，使用 100vw/100vh 铺满屏幕
 * - content：实际缩放内容，使用 transform-origin 保证中心缩放
 * 
 * 🛡️ 防溢出强化：
 * - overflow: hidden 强制隐藏超出内容
 * - overflow-x/y: hidden 双重保险
 * - body/html 防止滚动条出现
 */
.scalebox-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a0f14;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.scalebox-content {
  position: relative;
  overflow: hidden;
}
</style>
