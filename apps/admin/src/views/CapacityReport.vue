<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ICapacityReportData } from '@packages/shared';
import { ensureSharedProvider } from '@/composables';
import { useFeedback, SkeletonCard, SkeletonChart } from '@packages/shared';
import CapacityPivotSheet from '@/views/components/CapacityPivotSheet.vue';

const { toast } = useFeedback();
const loading = ref(false);
const sourceLabel = ref('--');
const reportRows = ref<ICapacityReportData[]>([]);

const totalYield = computed(() =>
  reportRows.value.reduce((sum, item) => sum + item.yield, 0)
);

const avgDefectRate = computed(() => {
  if (!reportRows.value.length) return 0;
  const sum = reportRows.value.reduce((acc, item) => acc + item.defectRate, 0);
  return sum / reportRows.value.length;
});

async function refreshReport(): Promise<void> {
  loading.value = true;
  try {
    const provider = await ensureSharedProvider('auto');
    sourceLabel.value = provider.runtimeStatus.sourceLabel;
    const rows = await provider.getCapacityReport();
    reportRows.value = rows;
  } catch (error) {
    toast.error('获取报表失败：' + (error as Error).message);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await refreshReport();
});
</script>

<template>
  <a-card title="产能上下文与报表">
    <template #extra>
      <span class="report-page__source">数据源：{{ sourceLabel }}</span>
    </template>

    <template v-if="loading && !reportRows.length">
      <SkeletonCard :lines="3" />
      <div style="margin-top: 16px">
        <SkeletonChart />
      </div>
    </template>
    <a-spin v-else :spinning="loading">
      <div class="report-page__kpi">
        <div class="kpi-card">
          <span>统计行数</span>
          <strong>{{ reportRows.length }}</strong>
        </div>
        <div class="kpi-card">
          <span>总产量</span>
          <strong>{{ totalYield }}</strong>
        </div>
        <div class="kpi-card">
          <span>平均不良率</span>
          <strong>{{ (avgDefectRate * 100).toFixed(2) }}%</strong>
        </div>
      </div>

      <div class="report-page__sheet">
        <CapacityPivotSheet :rows="reportRows" />
      </div>
    </a-spin>
  </a-card>
</template>

<style scoped>
.report-page__source {
  color: #3f637f;
}

.report-page__kpi {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.kpi-card {
  border: 1px solid #d1dfeb;
  border-radius: 8px;
  background: #f8fbff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-card span {
  color: #5c7e99;
  font-size: 12px;
}

.kpi-card strong {
  color: #234a66;
  font-size: 22px;
}

.report-page__sheet {
  margin-bottom: 12px;
}
</style>
