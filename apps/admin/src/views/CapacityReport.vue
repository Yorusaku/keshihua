<!-- CapacityReport.vue 产能透视报表 -->
<!-- 阶段：🟣 重构阶段（Vue Query + 配置抽离） -->

<template>
  <div class="capacity-report">
    <a-card title="产能透视报表">
      <!-- ✅ 加载状态：使用 a-spin 或骨架屏 -->
      <a-spin :spinning="query.isLoading" tip="加载数据中...">
        <!-- ✅ S2 Canvas 挂载容器 -->
        <div ref="s2ContainerRef" class="s2-container"></div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import { PivotSheet } from '@antv/s2';
import { useCapacityReportQuery } from '@packages/shared';
import type { ICapacityReportParams, ICapacityReportData } from '@packages/shared';
import {
  ROWS,
  COLUMNS,
  VALUES,
  S2_SIZE,
  S2_HIERARCHY_TYPE,
  S2_CONDITION_TEXT_MAP,
} from '@/constants';

// 📦 查询参数（默认空对象，表示不过滤）
const queryParameters = ref<ICapacityReportParams>({});

// 📦 Vue Query Hook
const query = useCapacityReportQuery(queryParameters);

// 📦 S2 容器 DOM 引用
const s2ContainerRef = ref<HTMLDivElement | null>(null);

// 📦 S2 实例（Canvas 表格引擎）
let s2Instance: PivotSheet | null = null;

/**
 * 🚀 onMounted：初始化 S2 绑定 watchEffect
 */
onMounted(() => {
  // 🛡️ 防御性编程：检查容器存在性
  if (!s2ContainerRef.value) {
    console.error('CapacityReport: s2ContainerRef 不存在');
    return;
  }

  // ✅ 监听 query.data 变化，数据加载完成后实例化 S2
  watchEffect(() => {
    if (query.data.value) {
      // ✅ 先销毁旧实例（如果存在）
      if (s2Instance) {
        s2Instance.destroy();
        s2Instance = null;
      }

      // ✅ 实例化 S2（使用抽离的配置常量）
      s2Instance = new PivotSheet(s2ContainerRef.value, {
        fields: {
          rows: ROWS,
          columns: COLUMNS,
          values: VALUES,
        },
        data: query.data.value,
      }, {
        width: S2_SIZE.width,
        height: S2_SIZE.height,
        hierarchyType: S2_HIERARCHY_TYPE,
        tooltip: {
          showPanel: true,
        },
        conditions: {
          text: [S2_CONDITION_TEXT_MAP.yield, S2_CONDITION_TEXT_MAP.defectRate],
        },
      });

      // ✅ 渲染表格
      s2Instance.render();
    }
  });
});

/**
 * 🧹 onBeforeUnmount：销毁 S2（防止内存泄漏）
 */
onBeforeUnmount(() => {
  // ✅ 销毁 S2 实例（释放 Canvas 资源）
  if (s2Instance) {
    s2Instance.destroy();
    s2Instance = null;
  }
});
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
