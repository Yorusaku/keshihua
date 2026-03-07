<!-- CapacityReport.vue 产能透视报表 -->
<!-- 阶段：🟢 绿灯阶段（业务实现） -->

<template>
  <div class="capacity-report">
    <a-card title="产能透视报表">
      <!-- ✅ S2 Canvas 挂载容器 -->
      <div ref="s2ContainerRef" class="s2-container"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { PivotSheet } from '@antv/s2';
import { fetchCapacityReport } from '@packages/shared';
import type { ICapacityReportData } from '@packages/shared';

// 📦 S2 容器 DOM 引用
const s2ContainerRef = ref<HTMLDivElement | null>(null);

// 📦 S2 实例（Canvas 表格引擎）
let s2Instance: PivotSheet | null = null;

// 📦 表格数据源
const tableData = ref<ICapacityReportData[]>([]);

// 📌 S2 数据配置（打平数据）
const s2DataConfig = computed(() => ({
  fields: {
    rows: ['factory', 'line'],      // ✅ 行维度：工厂 + 产线
    columns: ['date'],              // ✅ 列维度：日期
    values: ['yield', 'defectRate'], // ✅ 指标：产量 + 不良率
  },
  data: tableData.value,  // ✅ 动态数据源
}));

// 📌 S2 选项配置
const s2Options = {
  width: 1200,  // ✅ 宽度（根据容器自适应）
  height: 600,  // ✅ 高度（与容器一致）
  hierarchyType: 'tree',  // ✅ 树状结构（工厂 → 产线）
  tooltip: {
    showPanel: true,  // ✅ 显示面板提示
  },
  conditions: {
    text: [
      {
        field: 'yield',
        mapping: (value: number) => {
          // ✅ 产量高亮（绿色）
          return {
            fill: value > 8000 ? '#52c41a' : undefined,
          };
        },
      },
      {
        field: 'defectRate',
        mapping: (value: number) => {
          // ✅ 不良率高亮（红色）
          return {
            fill: value > 0.05 ? '#ff4d4f' : undefined,
          };
        },
      },
    ],
  },
};

/**
 * 🚀 onMounted：加载数据并实例化 S2
 */
onMounted(async () => {
  // 🛡️ 防御性编程：检查容器存在性
  if (!s2ContainerRef.value) {
    console.error('CapacityReport: s2ContainerRef 不存在');
    return;
  }

  try {
    // ✅ 先请求数据（500ms 延迟）
    const data = await fetchCapacityReport();
    tableData.value = data;

    // ✅ 数据加载完成后，实例化 S2
    s2Instance = new PivotSheet(s2ContainerRef.value, s2DataConfig.value, s2Options);

    // ✅ 渲染表格
    s2Instance.render();
  } catch (error) {
    console.error('CapacityReport: 加载数据失败', error);
  }
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
