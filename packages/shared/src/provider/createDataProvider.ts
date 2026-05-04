/**
 * 统一数据提供器工厂
 * 文件职责：根据 auto/api/mock 策略选择运行模式，并提供一致的数据访问接口。
 */

import { addAgv, fetchAgvList } from '../network/api/agv';
import { fetchCapacityData } from '../network/queries/capacity';
import { fetchCapacityReport } from '../network/api/report';
import { fetchSensorTimeSeries } from '../network/api/sensor';
import { agvSyncBus } from '../websocket/AgvSyncBus';
import { getDomainRealtimeBus } from '../websocket/realtime';
import {
  createRealtimeMessageId,
  createRealtimeSourceId,
  type RealtimeEnvelope,
} from '../websocket/realtime.types';
import { MockFactoryRuntime } from './mockRuntime';
import type {
  CreateDataProviderOptions,
  DataProvider,
  DataProviderMode,
  DashboardFilters,
  DashboardSnapshot,
  ProviderResolvedMode,
  ProviderRuntimeStatus,
} from './types';
import type { IAgvData } from '../websocket/types';

function createRuntimeStatus(
  requestedMode: DataProviderMode,
  resolvedMode: ProviderResolvedMode,
  detectedAt: number
): ProviderRuntimeStatus {
  return {
    requestedMode,
    resolvedMode,
    sourceLabel: resolvedMode === 'api' ? '真实接口' : '模拟数据',
    detectedAt,
  };
}

async function resolveMode(options: CreateDataProviderOptions): Promise<ProviderResolvedMode> {
  const mode = options.mode || 'auto';
  if (mode === 'api') {
    return 'api';
  }
  if (mode === 'mock') {
    return 'mock';
  }

  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  if (!fetchImpl) {
    return 'mock';
  }

  try {
    const response = await fetchImpl(options.probeUrl || '/api/health', {
      method: 'GET',
      headers: { 'x-data-provider-probe': '1' },
    });
    return response.ok ? 'api' : 'mock';
  } catch {
    return 'mock';
  }
}

function buildStatusBar(
  snapshot: DashboardSnapshot,
  filters: DashboardFilters | undefined,
  runtime: ProviderRuntimeStatus,
  now: number
): DashboardSnapshot['statusBar'] {
  const lineLabel =
    !filters?.lineId || filters.lineId === 'all'
      ? '全产线'
      : snapshot.lines.find((line) => line.id === filters.lineId)?.name || filters.lineId;

  return {
    shift: snapshot.capacity.shift,
    lineLabel,
    onlineRate: snapshot.capacity.onlineRate,
    alertCount: snapshot.capacity.alertCount,
    completionRate: snapshot.capacity.completionRate,
    sourceLabel: runtime.sourceLabel,
    lastSyncAt: now,
  };
}

const mockRealtimeSourceId = createRealtimeSourceId('mock-agv');

function publishMockAgvCreated(agv: IAgvData): void {
  const envelope: RealtimeEnvelope<IAgvData> = {
    messageId: createRealtimeMessageId('agv'),
    topic: 'agv.created',
    sourceId: mockRealtimeSourceId,
    timestamp: Date.now(),
    payload: agv,
  };
  agvSyncBus.broadcastNewAgvEnvelope(envelope);
  getDomainRealtimeBus().publishEnvelope(envelope);
}

export async function createDataProvider(
  options: CreateDataProviderOptions = {}
): Promise<DataProvider> {
  const now = options.now || (() => Date.now());
  const resolvedMode = await resolveMode(options);
  const runtimeStatus = createRuntimeStatus(options.mode || 'auto', resolvedMode, now());
  const runtime = new MockFactoryRuntime(now);

  const getDashboardSnapshot = async (filters?: DashboardFilters): Promise<DashboardSnapshot> => {
    // 真实接口模式下，用 API 同步最新 AGV 列表后再聚合视图模型。
    if (runtimeStatus.resolvedMode === 'api') {
      try {
        const agvResult = await fetchAgvList({ current: 1, pageSize: 300, status: undefined });
        runtime.replaceAgvByApi(agvResult.list);
      } catch {
        // API 拉取失败时保留本地状态，避免大屏抖动。
      }
    }

    runtime.nextAgvFrame();
    const capacityQueryData = await fetchCapacityData();
    const capacity = runtime.getCapacitySummary(filters);
    const mergedCapacity = {
      ...capacity,
      actual: Math.max(0, Math.round(capacityQueryData.completed + (capacity.target - capacityQueryData.total))),
      completionRate: Number(capacityQueryData.completionRate.toFixed(3)),
      timestamp: capacityQueryData.timestamp,
    };

    const snapshot: DashboardSnapshot = {
      lines: runtime.getLines(),
      agv: runtime.getAgvByFilters(filters),
      alerts: runtime.getAlerts(filters),
      timeline: runtime.getTimeline(filters),
      capacity: mergedCapacity,
      statusBar: {
        shift: mergedCapacity.shift,
        lineLabel: '全产线',
        onlineRate: mergedCapacity.onlineRate,
        alertCount: mergedCapacity.alertCount,
        completionRate: mergedCapacity.completionRate,
        sourceLabel: runtimeStatus.sourceLabel,
        lastSyncAt: now(),
      },
    };
    snapshot.statusBar = buildStatusBar(snapshot, filters, runtimeStatus, now());
    return snapshot;
  };

  return {
    runtimeStatus,
    getDashboardSnapshot,
    startAgvStream(handler, intervalMs = 100) {
      handler(runtime.getAgvByFilters());
      const timer = window.setInterval(() => {
        handler(runtime.nextAgvFrame());
      }, intervalMs);
      return () => window.clearInterval(timer);
    },
    async getAgvList(params) {
      if (runtimeStatus.resolvedMode === 'api') {
        return fetchAgvList(params);
      }
      return runtime.getAgvList(params);
    },
    async addAgv(payload) {
      if (runtimeStatus.resolvedMode === 'api') {
        try {
          return await addAgv(payload);
        } catch {
          const created = runtime.addAgv(payload);
          publishMockAgvCreated(created);
          return created;
        }
      }
      const created = runtime.addAgv(payload);
      publishMockAgvCreated(created);
      return created;
    },
    async getSensorTrend(params) {
      return fetchSensorTimeSeries(params);
    },
    async getCapacityReport(params) {
      return fetchCapacityReport(params);
    },
    async acknowledgeAlert(payload) {
      return runtime.acknowledgeAlert(payload);
    },
    async simulateSensorAlert(payload) {
      return runtime.simulateSensorAlert(payload);
    },
    async assignAlert(payload) {
      return runtime.assignAlert(payload);
    },
    async updateAlertProcess(payload) {
      return runtime.updateAlertProcess(payload);
    },
    async closeAlert(payload) {
      return runtime.closeAlert(payload);
    },
    async getAlertHistory(params) {
      return runtime.getAlertHistory(params);
    },
    async getAlertStatistics(filters) {
      return runtime.getAlertStatistics(filters);
    },
    async getAssignees() {
      return runtime.getAssignees();
    },
  };
}
