/**
 * 统一数据提供器类型定义
 * 文件职责：约束 dashboard/admin 共用的数据模型与接口契约。
 */

import type {
  IAgvListParams,
  IAgvListResponse,
  IAddAgvPayload,
} from '../network/api/agv';
import type {
  ICapacityReportData,
  ICapacityReportParams,
} from '../network/api/report';
import type {
  ISensorTimeSeriesParams,
  ISensorTimeSeriesResponse,
} from '../network/api/sensor';
import type { IAgvData } from '../websocket/types';

export type DataProviderMode = 'auto' | 'api' | 'mock';
export type ProviderResolvedMode = 'api' | 'mock';

export interface ProviderRuntimeStatus {
  requestedMode: DataProviderMode;
  resolvedMode: ProviderResolvedMode;
  sourceLabel: '真实接口' | '模拟数据';
  detectedAt: number;
}

export interface DashboardFilters {
  lineId?: string;
  shift?: string;
  timeRange?: '15m' | '1h' | '8h';
}

export interface ProductionLineZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProductionLine {
  id: string;
  name: string;
  zones: ProductionLineZone[];
}

export interface AgvLiveItem extends IAgvData {
  lineId: string;
  zoneId: string;
  battery: number;
  speed: number;
  task: string;
}

export interface SensorAlertItem {
  id: string;
  sensorId: string;
  lineId: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  threshold: number;
  value: number;
  impactedAgvIds: string[];
  suggestion: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: number;
  acknowledgedAt?: number;
}

export interface CapacitySummary {
  target: number;
  actual: number;
  completionRate: number;
  onlineRate: number;
  alertCount: number;
  affectedRate: number;
  shift: string;
  timestamp: number;
}

export interface EventTimelineItem {
  id: string;
  type: 'sensor-alert' | 'capacity-impact' | 'alert-ack';
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  lineId: string;
  agvId?: string;
  alertId?: string;
  timestamp: number;
}

export interface DashboardStatusBar {
  shift: string;
  lineLabel: string;
  onlineRate: number;
  alertCount: number;
  completionRate: number;
  sourceLabel: '真实接口' | '模拟数据';
  lastSyncAt: number;
}

export interface DashboardSnapshot {
  lines: ProductionLine[];
  agv: AgvLiveItem[];
  alerts: SensorAlertItem[];
  capacity: CapacitySummary;
  timeline: EventTimelineItem[];
  statusBar: DashboardStatusBar;
}

export interface AlertAcknowledgePayload {
  alertId: string;
  operator?: string;
  note?: string;
}

export interface AlertAcknowledgeResult {
  alert?: SensorAlertItem;
  timeline?: EventTimelineItem;
}

export interface SimulateSensorAlertPayload {
  lineId?: string;
  sensorId?: string;
  severity?: SensorAlertItem['severity'];
  message?: string;
}

export interface DataProvider {
  runtimeStatus: ProviderRuntimeStatus;
  getDashboardSnapshot(filters?: DashboardFilters): Promise<DashboardSnapshot>;
  startAgvStream(
    handler: (agvList: AgvLiveItem[]) => void,
    intervalMs?: number
  ): () => void;
  getAgvList(params: IAgvListParams): Promise<IAgvListResponse>;
  addAgv(payload: IAddAgvPayload): Promise<IAgvData>;
  getSensorTrend(params: ISensorTimeSeriesParams): Promise<ISensorTimeSeriesResponse>;
  getCapacityReport(params?: ICapacityReportParams): Promise<ICapacityReportData[]>;
  acknowledgeAlert(payload: AlertAcknowledgePayload): Promise<AlertAcknowledgeResult>;
  simulateSensorAlert(payload?: SimulateSensorAlertPayload): Promise<SensorAlertItem>;
}

export interface CreateDataProviderOptions {
  mode?: DataProviderMode;
  probeUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}
