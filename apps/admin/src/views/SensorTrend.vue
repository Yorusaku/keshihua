<!--
  传感器策略页
  文件职责：展示趋势图、活跃告警列表和 mock 异常模拟入口。
-->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { TrendChart } from '@packages/charts';
import type { SensorAlertItem } from '@packages/shared';
import { ensureSharedProvider } from '@/composables';

const route = useRoute();
const loading = ref(false);
const sourceLabel = ref('--');
const chartData = ref<Array<{ time: number; value: number }>>([]);
const alerts = ref<SensorAlertItem[]>([]);
const focusedAlertId = ref<string | null>(null);

const selectedAlert = computed(() => {
  if (!focusedAlertId.value) return alerts.value[0] || null;
  return alerts.value.find((item) => item.id === focusedAlertId.value) || alerts.value[0] || null;
});

async function refreshData(): Promise<void> {
  loading.value = true;
  try {
    const provider = await ensureSharedProvider('auto');
    sourceLabel.value = provider.runtimeStatus.sourceLabel;

    const endTime = Date.now();
    const trend = await provider.getSensorTrend({
      sensorId: typeof route.query.sensorId === 'string' ? route.query.sensorId : 'LINE-A-SEN-1',
      startTime: endTime - 60 * 60 * 1000,
      endTime,
      count: 600,
    });

    chartData.value = trend.data.map((item) => ({
      time: item.timestamp,
      value: item.value,
    }));

    const snapshot = await provider.getDashboardSnapshot({
      lineId: typeof route.query.lineId === 'string' ? route.query.lineId : 'all',
      timeRange: '1h',
    });
    alerts.value = snapshot.alerts;

    if (typeof route.query.alertId === 'string') {
      focusedAlertId.value = route.query.alertId;
    } else if (alerts.value[0]) {
      focusedAlertId.value = alerts.value[0].id;
    }
  } finally {
    loading.value = false;
  }
}

async function simulateAlert(): Promise<void> {
  const provider = await ensureSharedProvider('auto');
  await provider.simulateSensorAlert({
    lineId: typeof route.query.lineId === 'string' ? route.query.lineId : undefined,
    severity: 'high',
  });
  await refreshData();
}

onMounted(async () => {
  await refreshData();
});
</script>

<template>
  <div class="sensor-page">
    <a-card title="传感器策略与异常处置">
      <template #extra>
        <div class="sensor-page__extra">
          <span>数据源：{{ sourceLabel }}</span>
          <a-button size="small" @click="simulateAlert" :disabled="sourceLabel !== '模拟数据'">
            模拟异常
          </a-button>
        </div>
      </template>

      <a-spin :spinning="loading">
        <div class="sensor-page__chart">
          <TrendChart
            :data="chartData"
            title="传感器时序趋势（1h）"
            color="#2d89cf"
            :line-width="2"
          />
        </div>

        <div class="sensor-page__alerts">
          <article
            v-for="alert in alerts"
            :key="alert.id"
            class="sensor-alert"
            :class="{ 'sensor-alert--active': focusedAlertId === alert.id }"
            @click="focusedAlertId = alert.id"
          >
            <header>
              <strong>{{ alert.title }}</strong>
              <span>{{ alert.sensorId }}</span>
            </header>
            <p>{{ alert.message }}</p>
            <footer>
              当前值 {{ alert.value }} / 阈值 {{ alert.threshold }} · {{ alert.status }}
            </footer>
          </article>
        </div>

        <div v-if="selectedAlert" class="sensor-page__detail">
          <h4>处置建议</h4>
          <p>{{ selectedAlert.suggestion }}</p>
          <p>影响 AGV：{{ selectedAlert.impactedAgvIds.join('，') || '无' }}</p>
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<style scoped>
.sensor-page__extra {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #3d607c;
}

.sensor-page__chart {
  height: 320px;
  border: 1px solid #d6e4f0;
  border-radius: 10px;
  padding: 8px;
  background: #f9fcff;
}

.sensor-page__alerts {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.sensor-alert {
  border: 1px solid #d0e0ee;
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
  cursor: pointer;
}

.sensor-alert--active {
  border-color: #8cb9dd;
  background: #f1f8ff;
}

.sensor-alert header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.sensor-alert p {
  margin: 8px 0;
  color: #486a85;
}

.sensor-alert footer {
  color: #5a7892;
  font-size: 12px;
}

.sensor-page__detail {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cedeea;
  background: #f7fbff;
}

.sensor-page__detail h4 {
  margin: 0 0 6px;
}

.sensor-page__detail p {
  margin: 4px 0;
}
</style>
