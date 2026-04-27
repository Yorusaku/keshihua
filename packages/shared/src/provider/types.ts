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

  // 告警处理闭环字段
  assignedTo?: string;
  assignedAt?: number;
  assignedBy?: string;
  processingStatus?: AlertProcessingStatus;
  rootCause?: string;
  actionTaken?: string;
  resolution?: string;
  closedAt?: number;
  closedBy?: string;
  mttr?: number;
  processRecords?: AlertProcessRecord[];
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

// 告警处理进度状态
export type AlertProcessingStatus =
  | 'unassigned'
  | 'assigned'
  | 'in_progress'
  | 'completed';

// 告警处理记录
export interface AlertProcessRecord {
  id: string;
  alertId: string;
  operator: string;
  operatorName?: string;
  action: AlertProcessAction;
  content: string;
  timestamp: number;
  attachments?: string[];
}

// 告警处理操作类型
export type AlertProcessAction =
  | 'assign'
  | 'acknowledge'
  | 'analyze'
  | 'action'
  | 'resolve'
  | 'close'
  | 'comment';

// 告警查询参数
export interface AlertQueryParams {
  lineId?: string;
  sensorId?: string;
  severity?: SensorAlertItem['severity'];
  status?: SensorAlertItem['status'];
  processingStatus?: AlertProcessingStatus;
  assignedTo?: string;
  startTime?: number;
  endTime?: number;
  keyword?: string;
  current?: number;
  pageSize?: number;
}

// 告警查询响应
export interface AlertQueryResponse {
  total: number;
  list: SensorAlertItem[];
}

// 责任人信息
export interface AlertAssignee {
  id: string;
  name: string;
  role: string;
  department?: string;
}

// 告警统计数据
export interface AlertStatistics {
  totalCount: number;
  activeCount: number;
  resolvedCount: number;
  avgMttr: number;
  byLine: Record<string, number>;
  bySeverity: Record<string, number>;
  topFrequentSensors: Array<{
    sensorId: string;
    count: number;
  }>;
}

// 分配告警
export interface AssignAlertPayload {
  alertId: string;
  assignedTo: string;
  assignedBy: string;
  note?: string;
}

export interface AssignAlertResult {
  alert: SensorAlertItem;
  timeline?: EventTimelineItem;
}

// 更新处理记录
export interface UpdateAlertProcessPayload {
  alertId: string;
  operator: string;
  action: AlertProcessAction;
  content: string;
  rootCause?: string;
  actionTaken?: string;
}

export interface UpdateAlertProcessResult {
  alert: SensorAlertItem;
  record: AlertProcessRecord;
  timeline?: EventTimelineItem;
}

// 关闭告警
export interface CloseAlertPayload {
  alertId: string;
  operator: string;
  resolution: string;
  rootCause?: string;
  actionTaken?: string;
}

export interface CloseAlertResult {
  alert: SensorAlertItem;
  timeline?: EventTimelineItem;
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

  // 告警处理闭环方法
  assignAlert(payload: AssignAlertPayload): Promise<AssignAlertResult>;
  updateAlertProcess(payload: UpdateAlertProcessPayload): Promise<UpdateAlertProcessResult>;
  closeAlert(payload: CloseAlertPayload): Promise<CloseAlertResult>;
  getAlertHistory(params: AlertQueryParams): Promise<AlertQueryResponse>;
  getAlertStatistics(filters?: DashboardFilters): Promise<AlertStatistics>;
  getAssignees(): Promise<AlertAssignee[]>;
}

export interface CreateDataProviderOptions {
  mode?: DataProviderMode;
  probeUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}
