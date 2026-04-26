<!--
  产能报表页
  文件职责：展示班次 KPI、产量趋势和明细报表。
-->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { TrendChart } from '@packages/charts';
import type { ICapacityReportData } from '@packages/shared';
import { ensureSharedProvider } from '@/composables';
import { useFeedback, SkeletonCard, SkeletonChart } from '@packages/shared';

const { toast } = useFeedback();
const loading = ref(false);
const sourceLabel = ref('--');
const reportRows = ref<ICapacityReportData[]>([]);
const trendData = ref<Array<{ time: number; value: number }>>([]);

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
    reportRows.value = rows.slice(0, 80);

    const grouped = new Map<string, number>();
    for (let i = 0; i < reportRows.value.length; i += 1) {
      const row = reportRows.value[i];
      if (!row) continue;
      grouped.set(row.date, (grouped.get(row.date) || 0) + row.yield);
    }

    trendData.value = Array.from(grouped.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, value]) => ({
        time: new Date(date).getTime(),
        value,
      }));
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

      <div class="report-page__chart">
        <TrendChart
          :data="trendData"
          title="日产量趋势"
          color="#2f9a82"
          :line-width="2"
        />
      </div>

      <a-table :data-source="reportRows" :pagination="{ pageSize: 10 }" row-key="date">
        <a-table-column title="工厂" data-index="factory" key="factory" />
        <a-table-column title="产线" data-index="line" key="line" />
        <a-table-column title="日期" data-index="date" key="date" />
        <a-table-column title="产量" data-index="yield" key="yield" />
        <a-table-column title="不良率" key="defectRate">
          <template #default="{ record }">
            {{ (record.defectRate * 100).toFixed(2) }}%
          </template>
        </a-table-column>
      </a-table>
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

.report-page__chart {
  height: 280px;
  border: 1px solid #d6e4f0;
  border-radius: 10px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9fcff;
}
</style>
