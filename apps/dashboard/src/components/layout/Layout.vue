/**
 * Layout 布局组件（占位）
 * 文件路径：apps/dashboard/src/components/layout/Layout.vue
 * 阶段：🏁 终极组装（应用启动）
 * 
 * 📌 组件说明：
 * - MVP 阶段：暂不包含实际布局逻辑
 * - 资源占位：保留位置，后续 UI 搭建时扩展
 */

<template>
  <div class="layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * 📌 Layout 组件（MVP 阶段占位）
 * - 后续：添加头部导航栏、侧边栏等布局元素
 * - 当前：仅保留插槽容器
 */
</script>

<style scoped>
/* 📌 Layout 样式（MVP 阶段占位） */
.layout {
  width: 100%;
  height: 100%;
}
</style>
