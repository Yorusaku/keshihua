<!-- CapacityReport.vue 产能透视报表 -->
<!-- 阶段：🔴 红灯阶段（占位文件 - 业务逻辑待实现） -->

<template>
  <div class="capacity-report">
    <a-card title="产能透视报表">
      <!-- ✅ S2 Canvas 挂载容器 -->
      <div ref="s2ContainerRef" class="s2-container"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 📌 占位实现（红灯阶段）
 * @description 抛出错误，表示功能尚未实现
 */
throw new Error('Not implemented (Red Light): CapacityReport');
</script>

<style scoped>
.capacity-report {
  padding: 20px 0;
}

.s2-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e8e8e8;
}
</style>
