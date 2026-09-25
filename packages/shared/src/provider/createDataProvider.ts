import { addAgv, fetchAgvList } from "../network/api/agv";
import { fetchCapacityData } from "../network/queries/capacity";
import { deleteAgv as deleteAgvApi } from "../network/api/agv";
import { fetchCapacityReport } from "../network/api/report";
import { fetchSensorTimeSeries } from "../network/api/sensor";
import { agvSyncBus } from "../websocket/AgvSyncBus";
import { getDomainRealtimeBus } from "../websocket/realtime";
import {
  createRealtimeMessageId,
  createRealtimeSourceId,
  type RealtimeEnvelope,
} from "../websocket/realtime.types";
import { MockFactoryRuntime } from "./mockRuntime";
import type {
  CreateDataProviderOptions,
  DataProvider,
  DataProviderMode,
  DashboardFilters,
  DashboardSnapshot,
  ProviderResolvedMode,
  ProviderRuntimeStatus,
  SensorAlertItem,
} from "./types";
import type { IAgvData } from "../websocket/types";
import { apiPost, apiGet, configureApiMode } from "../network/api-client";

function normalizeAlert(raw: any): SensorAlertItem {
  const createdAt = raw.createdAt ?? raw.timestamp ?? Date.now();
  const toTimestamp = (value: unknown) =>
    typeof value === "number" ? value : value ? new Date(String(value)).getTime() : undefined;
  const processingStatus = raw.processingStatus === "pending" ? "unassigned" : raw.processingStatus;
  return {
    ...raw,
    timestamp: toTimestamp(createdAt) || Date.now(),
    acknowledgedAt: toTimestamp(raw.acknowledgedAt),
    assignedAt: toTimestamp(raw.assignedAt),
    closedAt: toTimestamp(raw.closedAt),
    assignedTo: raw.assignedTo ?? raw.assignedToId,
    assignedBy: raw.assignedBy ?? raw.assignedById,
    closedBy: raw.closedBy ?? raw.closedById,
    processingStatus: processingStatus || "unassigned",
    mttr: raw.mttr,
    processRecords: (raw.processRecords || []).map((record: any) => ({
      ...record,
      operator: record.operator ?? record.userId,
      content: record.content ?? record.detail ?? "",
      timestamp: toTimestamp(record.timestamp ?? record.createdAt) || Date.now(),
    })),
  };
}

function normalizeAlertResult(raw: any): any {
  if (raw && raw.alert) return { ...raw, alert: normalizeAlert(raw.alert) };
  return { alert: normalizeAlert(raw) };
}

function createRuntimeStatus(
  requestedMode: DataProviderMode,
  resolvedMode: ProviderResolvedMode,
  detectedAt: number
): ProviderRuntimeStatus {
  return {
    requestedMode,
    resolvedMode,
    sourceLabel: resolvedMode === "api" ? "真实接口" : "模拟数据",
    detectedAt,
  };
}

function resolveRequestedMode(options: CreateDataProviderOptions): DataProviderMode {
  const envMode = import.meta.env.VITE_API_MODE;
  if (options.mode === "api" || options.mode === "mock") return options.mode;
  if (envMode === "api" || envMode === "mock") return envMode;
  return options.mode || "auto";
}

async function resolveMode(options: CreateDataProviderOptions): Promise<ProviderResolvedMode> {
  const mode = resolveRequestedMode(options);
  if (mode === "api") return "api";
  if (mode === "mock") return "mock";

  const fetchImpl = options.fetchImpl || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : undefined);
  if (!fetchImpl) return "mock";

  try {
    const response = await fetchImpl(options.probeUrl || "/api/health", {
      method: "GET",
      headers: { "x-data-provider-probe": "1" },
    });
    if (!response.ok) return "mock";
    const body = await response.json().catch(() => null);
    return body?.ok === true ? "api" : "mock";
  } catch {
    return "mock";
  }
}

function buildStatusBar(
  snapshot: DashboardSnapshot,
  filters: DashboardFilters | undefined,
  runtime: ProviderRuntimeStatus,
  now: number
): DashboardSnapshot["statusBar"] {
  const lineLabel =
    !filters?.lineId || filters.lineId === "all"
      ? "全产线"
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

const mockRealtimeSourceId = createRealtimeSourceId("mock-agv");

function publishMockAgvCreated(agv: IAgvData): void {
  const envelope: RealtimeEnvelope<IAgvData> = {
    messageId: createRealtimeMessageId("agv"),
    topic: "agv.created",
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
  const requestedMode = resolveRequestedMode(options);
  const resolvedMode = await resolveMode(options);
  configureApiMode(resolvedMode);
  const runtimeStatus = createRuntimeStatus(requestedMode, resolvedMode, now());
  const runtime = new MockFactoryRuntime(now);
  const isApiMode = resolvedMode === "api";

  const getDashboardSnapshot = async (filters?: DashboardFilters): Promise<DashboardSnapshot> => {
    let apiAlerts: SensorAlertItem[] | null = null;
    if (isApiMode) {
      const agvResult = await fetchAgvList({ current: 1, pageSize: 300, status: undefined });
      runtime.replaceAgvByApi(agvResult.list);
      const alertResult = await apiGet<{ total: number; list: unknown[] }>("/alerts", {
        current: 1,
        pageSize: 300,
        lineId: filters?.lineId === "all" ? undefined : filters?.lineId,
      });
      apiAlerts = alertResult.list.map(normalizeAlert);
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
      alerts: apiAlerts ?? runtime.getAlerts(filters),
      timeline: runtime.getTimeline(filters),
      capacity: mergedCapacity,
      statusBar: {
        shift: mergedCapacity.shift,
        lineLabel: "全产线",
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
      if (isApiMode) return fetchAgvList(params);
      return runtime.getAgvList(params);
    },
    async addAgv(payload) {
      if (isApiMode) {
        return addAgv(payload);
      }
      const created = runtime.addAgv(payload);
      publishMockAgvCreated(created);
      return created;
    },
    async deleteAgv(id) {
      return deleteAgvApi(id);
    },
    async getSensorTrend(params) {
      return fetchSensorTimeSeries(params);
    },
    async getCapacityReport(params) {
      return fetchCapacityReport(params);
    },
    async acknowledgeAlert(payload) {
      if (isApiMode) {
        return normalizeAlertResult(await apiPost(`/alerts/${payload.alertId}/acknowledge`, {}));
      }
      return runtime.acknowledgeAlert(payload);
    },
    async simulateSensorAlert(payload) {
      if (isApiMode) {
        return normalizeAlert(await apiPost("/alerts", payload));
      }
      return runtime.simulateSensorAlert(payload);
    },
    async assignAlert(payload) {
      if (isApiMode) {
        try {
          return normalizeAlertResult(await apiPost(`/alerts/${payload.alertId}/assign`, {
            assignedToId: payload.assignedTo,
            version: payload.version ?? 0,
          }));
        } catch (e: any) {
          if (e?.message?.includes("告警已被他人修改") || e?.message?.includes("Conflict")) {
            throw new Error("该告警已被他人处理，请刷新后重试");
          }
          throw e;
        }
      }
      return runtime.assignAlert(payload);
    },
    async updateAlertProcess(payload) {
      if (isApiMode) {
        return normalizeAlertResult(
          await apiPost(`/alerts/${payload.alertId}/process`, {
            operator: payload.operator,
            action: payload.action,
            content: payload.content,
            rootCause: payload.rootCause,
            actionTaken: payload.actionTaken,
          })
        );
      }
      return runtime.updateAlertProcess(payload);
    },
    async closeAlert(payload) {
      if (isApiMode) {
        return normalizeAlertResult(
          await apiPost(`/alerts/${payload.alertId}/close`, {
            resolution: payload.resolution,
            rootCause: payload.rootCause,
            actionTaken: payload.actionTaken,
          })
        );
      }
      return runtime.closeAlert(payload);
    },
    async getAlertHistory(params) {
      if (isApiMode) {
        const result = await apiGet<{ total: number; list: unknown[] }>("/alerts", params);
        return { total: result.total, list: result.list.map(normalizeAlert) };
      }
      return runtime.getAlertHistory(params);
    },
    async getAlertStatistics(filters) {
      if (isApiMode) {
        const result = await apiGet<{ total: number; list: SensorAlertItem[] }>("/alerts", {
          current: 1,
          pageSize: 1000,
          lineId: filters?.lineId,
        });
        const list = result.list;
        const resolved = list.filter((item) => item.status === "resolved");
        return {
          totalCount: result.total,
          activeCount: list.filter((item) => item.status === "active").length,
          resolvedCount: resolved.length,
          avgMttr: resolved.length
            ? resolved.reduce((sum, item) => sum + (item.mttr || 0), 0) / resolved.length
            : 0,
          byLine: {},
          bySeverity: {},
          topFrequentSensors: [],
        };
      }
      return runtime.getAlertStatistics(filters);
    },
    async getAssignees() {
      if (isApiMode) {
        return apiGet<Array<{ id: string; name: string; role: string }>>("/users");
      }
      return runtime.getAssignees();
    },
  };
}
