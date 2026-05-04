<!--
  Dashboard 主页面
  文件职责：装配工业驾驶舱四区布局，串联 AGV + 传感器 + 产能闭环。
-->

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { AgvRenderer } from '@packages/charts';
import {
  DataBuffer,
  createDataProvider,
  getDomainRealtimeBus,
  agvSyncBus,
  useFeedback,
  alertSyncBus,
  type RealtimeEnvelope,
  type AgvLiveItem,
  type DataProvider,
  type DashboardSnapshot,
  type ProductionLineZone,
  type SensorAlertItem,
} from '@packages/shared';
import { Layout } from '@/components/layout';
import { ScaleBox } from '@/components/scalebox';
import { useDashboardUiStore } from '@/stores/dashboardUi';

const { toast, withLoading } = useFeedback();

const uiStore = useDashboardUiStore();
const { filters, focusedAgvId, detailDrawerOpen } = storeToRefs(uiStore);

const stageContainerRef = ref<HTMLDivElement | null>(null);
const rendererRef = shallowRef<AgvRenderer | null>(null);
const providerRef = shallowRef<DataProvider | null>(null);

const loading = ref(true);
const loadingError = ref('');
const snapshotRef = ref<DashboardSnapshot | null>(null);

// 业务主状态采用 Map + shallowRef，避免对海量 AGV 对象做深层代理。
const agvMapRef = shallowRef<Map<string, AgvLiveItem>>(new Map());
let stopAgvStream: (() => void) | null = null;
let snapshotTimerId: number | null = null;
let snapshotPending = false;
const domainRealtimeBus = getDomainRealtimeBus();
const messageDedupCache = new Map<string, number>();
const DEDUP_TTL_MS = 60_000;

const adminBaseUrl = (import.meta.env.VITE_ADMIN_BASE_URL as string | undefined) || 'http://localhost:5174';

function shouldConsumeEnvelope(envelope: RealtimeEnvelope<unknown>): boolean {
  const now = Date.now();
  messageDedupCache.forEach((timestamp, key) => {
    if (now - timestamp > DEDUP_TTL_MS) {
      messageDedupCache.delete(key);
    }
  });
  const key = `${envelope.messageId}:${envelope.sourceId}`;
  if (messageDedupCache.has(key)) {
    return false;
  }
  messageDedupCache.set(key, now);
  return true;
}

function toLiveAgvItem(agv: {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'moving' | 'error';
  timestamp: number;
}): AgvLiveItem {
  return {
    ...agv,
    lineId: 'line-a',
    zoneId: 'line-a-zone-1',
    battery: 100,
    speed: agv.status === 'moving' ? 1.2 : 0,
    task: agv.status === 'moving' ? '物料转运' : '待命',
  };
}

const selectedLineId = computed({
  get: () => filters.value.lineId || 'all',
  set: (value: string) => uiStore.updateFilters({ lineId: value }),
});

const selectedShift = computed({
  get: () => filters.value.shift || '白班',
  set: (value: string) => uiStore.updateFilters({ shift: value }),
});

const selectedTimeRange = computed({
  get: () => filters.value.timeRange || '1h',
  set: (value: '15m' | '1h' | '8h') => uiStore.updateFilters({ timeRange: value }),
});

const lineOptions = computed(() => {
  const lines = snapshotRef.value?.lines || [];
  return [
    { value: 'all', label: '全产线' },
    ...lines.map((line) => ({ value: line.id, label: line.name })),
  ];
});

const statusBar = computed(() => snapshotRef.value?.statusBar);
const alerts = computed(() => snapshotRef.value?.alerts || []);
const timeline = computed(() => snapshotRef.value?.timeline || []);

const agvList = computed(() => Array.from(agvMapRef.value.values()));

const focusedAgv = computed(() => {
  if (!focusedAgvId.value) {
    return null;
  }
  return agvMapRef.value.get(focusedAgvId.value) || null;
});

const selectedAlert = computed(() => {
  const currentAlertId = uiStore.selectedAlertId;
  if (!currentAlertId) {
    return alerts.value[0] || null;
  }
  return alerts.value.find((item) => item.id === currentAlertId) || alerts.value[0] || null;
});

const selectedAlertImpactedAgv = computed(() => {
  const alert = selectedAlert.value;
  if (!alert) {
    return [];
  }
  return alert.impactedAgvIds
    .map((agvId) => agvMapRef.value.get(agvId))
    .filter((item): item is AgvLiveItem => Boolean(item));
});

const stageZones = computed<ProductionLineZone[]>(() => {
  const lines = snapshotRef.value?.lines || [];
  const lineId = filters.value.lineId;
  if (!lineId || lineId === 'all') {
    return lines.flatMap((line) => line.zones);
  }
  return lines.find((line) => line.id === lineId)?.zones || [];
});

const adminDetailLink = computed(() => {
  const alert = selectedAlert.value;
  if (!alert) {
    return `${adminBaseUrl}/agv`;
  }
  const params = new URLSearchParams({
    lineId: alert.lineId,
    sensorId: alert.sensorId,
    alertId: alert.id,
    shift: selectedShift.value,
    source: statusBar.value?.sourceLabel || 'mock',
  });
  if (selectedAlertImpactedAgv.value[0]) {
    params.set('agvId', selectedAlertImpactedAgv.value[0].id);
  }
  return `${adminBaseUrl}/agv/sensor?${params.toString()}`;
});

function formatPercent(value: number | undefined): string {
  if (typeof value !== 'number') {
    return '--';
  }
  return `${(value * 100).toFixed(1)}%`;
}

function formatTime(timestamp: number | undefined): string {
  if (!timestamp) {
    return '--:--:--';
  }
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });
}

function alertClass(alert: SensorAlertItem): string {
  return `alert-card--${alert.severity}`;
}

// 处理进度文本
function getProcessingStatusText(status?: string): string {
  const texts: Record<string, string> = {
    unassigned: '未分配',
    assigned: '已分配',
    in_progress: '处理中',
    completed: '已完成',
  };
  return texts[status || 'unassigned'] || '未分配';
}

// 处理进度颜色类
function getProcessingStatusClass(status?: string): string {
  const classes: Record<string, string> = {
    unassigned: 'status-badge--default',
    assigned: 'status-badge--blue',
    in_progress: 'status-badge--orange',
    completed: 'status-badge--green',
  };
  return classes[status || 'unassigned'] || 'status-badge--default';
}

function timelineClass(level: 'info' | 'warning' | 'critical'): string {
  if (level === 'critical') {
    return 'timeline-item--critical';
  }
  if (level === 'warning') {
    return 'timeline-item--warning';
  }
  return 'timeline-item--info';
}

function syncAgvMap(agvListInput: AgvLiveItem[]): void {
  const nextMap = new Map<string, AgvLiveItem>();
  const slimAgv = [];

  for (let i = 0; i < agvListInput.length; i += 1) {
    const agv = agvListInput[i];
    if (!agv) {
      continue;
    }
    nextMap.set(agv.id, agv);
    slimAgv.push({
      id: agv.id,
      x: agv.x,
      y: agv.y,
      status: agv.status,
      timestamp: agv.timestamp,
    });
  }

  agvMapRef.value = nextMap;
  DataBuffer.getInstance().pushData(slimAgv);
}

function initRenderer(): void {
  if (!stageContainerRef.value) {
    return;
  }
  const renderer = markRaw(new AgvRenderer(stageContainerRef.value));
  renderer.startAnimationLoop(() => Array.from(agvMapRef.value.values()));
  rendererRef.value = renderer;
}

async function fetchSnapshot(): Promise<void> {
  if (!providerRef.value || snapshotPending) {
    return;
  }

  snapshotPending = true;
  try {
    const data = await providerRef.value.getDashboardSnapshot(filters.value);
    snapshotRef.value = data;
    syncAgvMap(data.agv);

    if (!uiStore.selectedAlertId && data.alerts[0]) {
      uiStore.openAlertDetail(data.alerts[0].id);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '快照拉取失败';
    loadingError.value = errorMessage;
    toast.error('数据加载失败：' + errorMessage);
  } finally {
    snapshotPending = false;
  }
}

async function acknowledgeAlert(alert: SensorAlertItem): Promise<void> {
  if (!providerRef.value) {
    return;
  }
  try {
    await withLoading(
      providerRef.value.acknowledgeAlert({
        alertId: alert.id,
        operator: 'dashboard',
      }),
      '确认中...'
    );
    toast.success('告警已确认');
    await fetchSnapshot();
  } catch (error) {
    toast.error('确认失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
}

function openAlertDetail(alert: SensorAlertItem): void {
  uiStore.openAlertDetail(alert.id);
  uiStore.setDeepLinkContext({
    lineId: alert.lineId,
    sensorId: alert.sensorId,
    alertId: alert.id,
    shift: selectedShift.value,
    source: statusBar.value?.sourceLabel || 'mock',
  });

  if (alert.impactedAgvIds[0]) {
    uiStore.focusAgv(alert.impactedAgvIds[0]);
  }
}

async function bootstrapDashboard(): Promise<void> {
  loading.value = true;
  loadingError.value = '';

  try {
    const provider = markRaw(await createDataProvider({ mode: 'auto' }));
    providerRef.value = provider;

    await fetchSnapshot();
    initRenderer();

    stopAgvStream = provider.startAgvStream((nextAgv) => {
      syncAgvMap(nextAgv);
    }, 120);

    snapshotTimerId = window.setInterval(() => {
      void fetchSnapshot();
    }, 5000);

    // 订阅告警跨端同步事件
    const unsubscribeAssigned = alertSyncBus.subscribeAlertAssignedEnvelope((envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeUpdated = alertSyncBus.subscribeAlertUpdatedEnvelope((envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeClosed = alertSyncBus.subscribeAlertClosedEnvelope((envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeWsAssigned = domainRealtimeBus.subscribe('alert.assigned', (envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeWsUpdated = domainRealtimeBus.subscribe('alert.updated', (envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeWsClosed = domainRealtimeBus.subscribe('alert.closed', (envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      void fetchSnapshot();
    });
    const unsubscribeLocalAgv = agvSyncBus.subscribeNewAgvEnvelope((envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      const currentMap = new Map(agvMapRef.value);
      currentMap.set(envelope.payload.id, toLiveAgvItem(envelope.payload));
      agvMapRef.value = currentMap;
      DataBuffer.getInstance().pushData([envelope.payload]);
    });
    const unsubscribeWsAgv = domainRealtimeBus.subscribe('agv.created', (envelope) => {
      if (!shouldConsumeEnvelope(envelope)) {
        return;
      }
      const currentMap = new Map(agvMapRef.value);
      currentMap.set(envelope.payload.id, toLiveAgvItem(envelope.payload));
      agvMapRef.value = currentMap;
      DataBuffer.getInstance().pushData([envelope.payload]);
    });

    // 在清理时取消订阅
    onBeforeUnmount(() => {
      unsubscribeAssigned();
      unsubscribeUpdated();
      unsubscribeClosed();
      unsubscribeWsAssigned();
      unsubscribeWsUpdated();
      unsubscribeWsClosed();
      unsubscribeLocalAgv();
      unsubscribeWsAgv();
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '初始化失败';
    loadingError.value = errorMessage;
    toast.error('驾驶舱初始化失败：' + errorMessage);
  } finally {
    loading.value = false;
  }
}

async function retryBootstrap(): Promise<void> {
  cleanupDashboard();
  await bootstrapDashboard();
}

function cleanupDashboard(): void {
  if (snapshotTimerId !== null) {
    window.clearInterval(snapshotTimerId);
    snapshotTimerId = null;
  }
  if (stopAgvStream) {
    stopAgvStream();
    stopAgvStream = null;
  }
  if (rendererRef.value) {
    rendererRef.value.dispose();
    rendererRef.value = null;
  }
  DataBuffer.getInstance().clear();
  messageDedupCache.clear();
}

watch(
  () => ({ ...filters.value }),
  () => {
    void fetchSnapshot();
  },
  { deep: true }
);

onMounted(() => {
  void bootstrapDashboard();
});

onBeforeUnmount(() => {
  cleanupDashboard();
});
</script>

<template>
  <Layout>
    <template #top>
      <div class="top-status">
        <div class="top-status__headline">
          <h1>智造远望 · 工业监控驾驶舱</h1>
          <p>AGV · 传感器 · 产能一体闭环</p>
        </div>

        <div class="top-status__filters">
          <label>
            产线
            <select v-model="selectedLineId">
              <option v-for="line in lineOptions" :key="line.value" :value="line.value">
                {{ line.label }}
              </option>
            </select>
          </label>

          <label>
            班次
            <select v-model="selectedShift">
              <option value="白班">白班</option>
              <option value="中班">中班</option>
              <option value="夜班">夜班</option>
            </select>
          </label>

          <label>
            时间范围
            <select v-model="selectedTimeRange">
              <option value="15m">最近 15 分钟</option>
              <option value="1h">最近 1 小时</option>
              <option value="8h">最近 8 小时</option>
            </select>
          </label>
        </div>

        <div class="top-status__metrics">
          <div class="metric-chip">
            <span>在线率</span>
            <strong>{{ formatPercent(statusBar?.onlineRate) }}</strong>
          </div>
          <div class="metric-chip metric-chip--warn">
            <span>告警数</span>
            <strong>{{ statusBar?.alertCount ?? '--' }}</strong>
          </div>
          <div class="metric-chip">
            <span>达成率</span>
            <strong>{{ formatPercent(statusBar?.completionRate) }}</strong>
          </div>
          <div class="metric-chip">
            <span>数据源</span>
            <strong>{{ statusBar?.sourceLabel ?? '--' }}</strong>
          </div>
          <div class="metric-chip">
            <span>最后同步</span>
            <strong>{{ formatTime(statusBar?.lastSyncAt) }}</strong>
          </div>
        </div>
      </div>
    </template>

    <template #stage>
      <ScaleBox :width="1920" :height="1080">
        <div class="stage-root">
          <div ref="stageContainerRef" class="stage-canvas"></div>

          <div class="stage-zones">
            <div
              v-for="zone in stageZones"
              :key="zone.id"
              class="stage-zone"
              :class="{ 'stage-zone--highlight': selectedLineId !== 'all' }"
              :style="{
                left: `${zone.x}px`,
                top: `${zone.y}px`,
                width: `${zone.width}px`,
                height: `${zone.height}px`,
              }"
            >
              <span>{{ zone.name }}</span>
            </div>
          </div>

          <div class="stage-overview">
            <p>在线 AGV：{{ agvList.length }}</p>
            <p>活跃告警：{{ alerts.length }}</p>
            <p>当前班次：{{ statusBar?.shift ?? selectedShift }}</p>
          </div>

          <div v-if="focusedAgv" class="stage-focus-card">
            <h3>聚焦车辆 {{ focusedAgv.id }}</h3>
            <p>所属产线：{{ focusedAgv.lineId }}</p>
            <p>运行状态：{{ focusedAgv.status }}</p>
            <p>当前任务：{{ focusedAgv.task }}</p>
            <p>电量：{{ focusedAgv.battery }}%</p>
          </div>

          <div v-if="loading" class="stage-mask">正在初始化驾驶舱...</div>
          <div v-else-if="loadingError" class="stage-mask stage-mask--error">
            <div class="error-content">
              <p>{{ loadingError }}</p>
              <button class="retry-button" @click="retryBootstrap">重试</button>
            </div>
          </div>
        </div>
      </ScaleBox>
    </template>

    <template #intel>
      <div class="intel-panel">
        <div class="intel-panel__header">
          <h2>异常情报栏</h2>
          <small>{{ statusBar?.sourceLabel ?? '未知数据源' }}</small>
        </div>

        <div class="intel-panel__alerts">
          <article
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-card"
            :class="alertClass(alert)"
          >
            <header>
              <strong>{{ alert.title }}</strong>
              <span>{{ alert.sensorId }}</span>
            </header>
            <p>{{ alert.message }}</p>
            <div class="alert-card__meta">
              <span class="status-badge" :class="getProcessingStatusClass(alert.processingStatus)">
                {{ getProcessingStatusText(alert.processingStatus) }}
              </span>
              <span v-if="alert.assignedTo" class="assignee-info">
                责任人: {{ alert.assignedTo }}
              </span>
            </div>
            <footer>
              <span>当前值 {{ alert.value }} / 阈值 {{ alert.threshold }}</span>
              <div class="alert-card__actions">
                <button @click="openAlertDetail(alert)">查看详情</button>
                <button
                  v-if="alert.status === 'active'"
                  class="alert-card__btn-primary"
                  @click="acknowledgeAlert(alert)"
                >
                  确认告警
                </button>
              </div>
            </footer>
          </article>

          <div v-if="!alerts.length" class="intel-panel__empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M32 20v16m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            </svg>
            <p>当前无活跃告警，系统运行平稳</p>
          </div>
        </div>

        <div class="intel-panel__drawer" :class="{ 'intel-panel__drawer--open': detailDrawerOpen }">
          <div class="drawer-header">
            <h3>实体详情</h3>
            <button @click="uiStore.closeAlertDetail()">收起</button>
          </div>
          <template v-if="selectedAlert">
            <p>告警编号：{{ selectedAlert.id }}</p>
            <p>建议动作：{{ selectedAlert.suggestion }}</p>
            <p>影响范围：{{ selectedAlert.lineId }} · {{ selectedAlert.impactedAgvIds.length }} 台 AGV</p>
            <ul>
              <li v-for="agv in selectedAlertImpactedAgv" :key="agv.id">
                {{ agv.id }} · {{ agv.task }} · {{ agv.status }}
              </li>
            </ul>
            <a :href="adminDetailLink" target="_blank" rel="noopener noreferrer">跳转后台继续处置</a>
          </template>
          <p v-else>尚未选择告警。</p>
        </div>
      </div>
    </template>

    <template #timeline>
      <div class="timeline-panel">
        <header>
          <h2>事件轨</h2>
          <span>展示异常发现、影响评估与确认闭环</span>
        </header>

        <ul class="timeline-list">
          <li
            v-for="item in timeline"
            :key="item.id"
            class="timeline-item"
            :class="timelineClass(item.level)"
          >
            <div class="timeline-item__time">{{ formatTime(item.timestamp) }}</div>
            <div class="timeline-item__content">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </div>
          </li>
          <li v-if="!timeline.length" class="timeline-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="12" width="24" height="24" rx="2" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M20 20h8M20 24h8M20 28h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
            </svg>
            <span>暂无事件</span>
          </li>
        </ul>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.top-status {
  height: 100%;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) minmax(0, 560px);
  align-items: center;
  gap: 18px;
  padding: 0 20px;
  color: #e9f4ff;
}

.top-status__headline h1 {
  font-size: 23px;
  line-height: 1.2;
  margin: 0;
  letter-spacing: 1px;
}

.top-status__headline p {
  margin: 6px 0 0;
  color: rgba(189, 216, 239, 0.86);
}

.top-status__filters {
  display: flex;
  gap: 10px;
}

.top-status__filters label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: rgba(178, 203, 222, 0.92);
}

.top-status__filters select {
  min-width: 120px;
  border-radius: 8px;
  border: 1px solid rgba(125, 170, 201, 0.65);
  background: rgba(7, 27, 44, 0.78);
  color: #f2f8ff;
  padding: 6px 10px;
}

.top-status__metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.metric-chip {
  border: 1px solid rgba(112, 159, 190, 0.6);
  border-radius: 9px;
  background: rgba(7, 30, 47, 0.84);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-chip span {
  color: rgba(180, 209, 231, 0.78);
  font-size: 12px;
}

.metric-chip strong {
  font-size: 16px;
}

.metric-chip--warn strong {
  color: #ffbf5f;
}

.stage-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stage-canvas {
  position: absolute;
  inset: 0;
}

.stage-zones {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stage-zone {
  position: absolute;
  border: 1px dashed rgba(120, 167, 199, 0.68);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(22, 46, 68, 0.45), rgba(11, 30, 48, 0.22));
  box-shadow: inset 0 0 20px rgba(38, 124, 162, 0.18);
}

.stage-zone span {
  position: absolute;
  top: 10px;
  left: 12px;
  color: rgba(196, 224, 244, 0.88);
  font-size: 14px;
}

.stage-zone--highlight {
  border-color: rgba(251, 180, 96, 0.74);
}

.stage-overview {
  position: absolute;
  top: 16px;
  left: 16px;
  border: 1px solid rgba(117, 170, 200, 0.58);
  border-radius: 10px;
  background: rgba(4, 20, 32, 0.78);
  padding: 12px;
  color: #d8efff;
  min-width: 220px;
}

.stage-overview p {
  margin: 4px 0;
}

.stage-focus-card {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 260px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(252, 193, 92, 0.62);
  background: rgba(39, 28, 13, 0.62);
  color: #ffe2b5;
}

.stage-focus-card h3 {
  margin: 0 0 8px;
}

.stage-focus-card p {
  margin: 4px 0;
}

.stage-mask {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(7, 20, 33, 0.72);
  color: #b7def8;
  font-size: 18px;
  z-index: 20;
}

.stage-mask--error {
  color: #ff9b93;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-content p {
  margin: 0;
}

.retry-button {
  border-radius: 8px;
  border: 1px solid rgba(255, 155, 147, 0.6);
  background: rgba(60, 21, 25, 0.7);
  color: #ffc9c4;
  padding: 10px 24px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.retry-button:hover {
  background: rgba(80, 31, 35, 0.8);
  border-color: rgba(255, 155, 147, 0.8);
}

.intel-panel {
  height: 100%;
  display: grid;
  grid-template-rows: 68px minmax(0, 1fr) auto;
}

.intel-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(109, 151, 178, 0.36);
  color: #dbf2ff;
}

.intel-panel__header h2 {
  margin: 0;
  font-size: 18px;
}

.intel-panel__alerts {
  padding: 10px 12px;
  overflow: auto;
}

.alert-card {
  border: 1px solid rgba(116, 159, 186, 0.44);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  background: rgba(9, 30, 49, 0.7);
  color: #dff3ff;
}

.alert-card header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.alert-card p {
  margin: 8px 0 10px;
  font-size: 13px;
  color: rgba(215, 232, 245, 0.9);
}

.alert-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge--default {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
}

.status-badge--blue {
  background: rgba(24, 144, 255, 0.2);
  color: #69c0ff;
}

.status-badge--orange {
  background: rgba(250, 173, 20, 0.2);
  color: #ffc53d;
}

.status-badge--green {
  background: rgba(82, 196, 26, 0.2);
  color: #95de64;
}

.assignee-info {
  color: rgba(215, 232, 245, 0.8);
}

.alert-card footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
}

.alert-card__actions {
  display: flex;
  gap: 8px;
}

.alert-card__actions button {
  border-radius: 6px;
  border: 1px solid rgba(128, 170, 196, 0.7);
  background: rgba(7, 37, 61, 0.82);
  color: #dcf5ff;
  padding: 6px 8px;
  cursor: pointer;
}

.alert-card__btn-primary {
  border-color: rgba(255, 183, 92, 0.85) !important;
  color: #ffdba8 !important;
}

.alert-card--critical {
  border-color: rgba(255, 120, 120, 0.75);
  background: linear-gradient(135deg, rgba(60, 21, 25, 0.7), rgba(44, 18, 24, 0.5));
}

.alert-card--high {
  border-color: rgba(255, 188, 97, 0.82);
}

.alert-card--medium {
  border-color: rgba(121, 190, 244, 0.8);
}

.intel-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  color: rgba(185, 214, 236, 0.72);
}

.intel-panel__empty svg {
  color: rgba(185, 214, 236, 0.5);
}

.intel-panel__empty p {
  margin: 0;
  font-size: 14px;
}

.intel-panel__drawer {
  border-top: 1px solid rgba(115, 158, 184, 0.35);
  padding: 10px 12px;
  background: rgba(5, 19, 31, 0.84);
  color: #d8efff;
  max-height: 0;
  overflow: hidden;
  transition: max-height 260ms ease;
}

.intel-panel__drawer--open {
  max-height: 240px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
}

.drawer-header button {
  border: 1px solid rgba(120, 168, 199, 0.66);
  border-radius: 6px;
  background: rgba(11, 43, 67, 0.8);
  color: #d7edff;
  padding: 4px 8px;
  cursor: pointer;
}

.intel-panel__drawer p {
  margin: 7px 0;
  font-size: 13px;
}

.intel-panel__drawer ul {
  margin: 8px 0;
  padding-left: 18px;
}

.intel-panel__drawer a {
  color: #8fd3ff;
}

.timeline-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  color: #d9f1ff;
}

.timeline-panel header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.timeline-panel h2 {
  margin: 0;
  font-size: 18px;
}

.timeline-panel span {
  color: rgba(178, 212, 235, 0.7);
  font-size: 12px;
}

.timeline-list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-auto-rows: minmax(42px, auto);
  gap: 8px;
  overflow: auto;
}

.timeline-item {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  border: 1px solid rgba(118, 158, 186, 0.4);
  border-radius: 8px;
  padding: 8px 10px;
  background: rgba(8, 31, 50, 0.7);
}

.timeline-item__time {
  font-size: 12px;
  color: rgba(189, 219, 240, 0.85);
}

.timeline-item__content strong {
  font-size: 14px;
}

.timeline-item__content p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(194, 220, 238, 0.86);
}

.timeline-item--critical {
  border-color: rgba(255, 128, 128, 0.8);
}

.timeline-item--warning {
  border-color: rgba(255, 188, 96, 0.76);
}

.timeline-item--info {
  border-color: rgba(118, 184, 236, 0.72);
}

.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(174, 204, 226, 0.75);
  align-self: center;
}

.timeline-empty svg {
  color: rgba(174, 204, 226, 0.5);
}

.timeline-empty span {
  font-size: 14px;
}

@media (max-width: 1180px) {
  .top-status {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, auto);
    gap: 8px;
    padding: 10px 14px;
  }

  .top-status__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
