/**
 * 统一数据提供器 mock 运行时
 * 文件职责：维护 AGV、告警、产能与事件轨状态，并提供可重复的演示流。
 */

import type { IAddAgvPayload, IAgvListParams, IAgvListResponse } from '../network/api/agv';
import type { IAgvData } from '../websocket/types';
import type {
  AgvLiveItem,
  AlertAcknowledgePayload,
  AlertAcknowledgeResult,
  CapacitySummary,
  DashboardFilters,
  EventTimelineItem,
  ProductionLine,
  SensorAlertItem,
  SimulateSensorAlertPayload,
} from './types';

const LINE_DEFS: ProductionLine[] = [
  {
    id: 'line-a',
    name: 'A 产线',
    zones: [
      { id: 'line-a-zone-1', name: '冲压区', x: 120, y: 140, width: 560, height: 260 },
      { id: 'line-a-zone-2', name: '装配区', x: 720, y: 140, width: 560, height: 260 },
    ],
  },
  {
    id: 'line-b',
    name: 'B 产线',
    zones: [
      { id: 'line-b-zone-1', name: '焊接区', x: 120, y: 440, width: 560, height: 260 },
      { id: 'line-b-zone-2', name: '检测区', x: 720, y: 440, width: 560, height: 260 },
    ],
  },
  {
    id: 'line-c',
    name: 'C 产线',
    zones: [
      { id: 'line-c-zone-1', name: '包装区', x: 1320, y: 140, width: 460, height: 260 },
      { id: 'line-c-zone-2', name: '入库区', x: 1320, y: 440, width: 460, height: 260 },
    ],
  },
];

const SHIFT_LABELS = ['白班', '中班', '夜班'] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickLine(index: number): ProductionLine {
  return LINE_DEFS[index % LINE_DEFS.length] || LINE_DEFS[0]!;
}

function pickZone(line: ProductionLine, index: number): ProductionLine['zones'][number] {
  return line.zones[index % line.zones.length] || line.zones[0]!;
}

function pickShift(timestamp: number): string {
  const hour = new Date(timestamp).getHours();
  if (hour >= 8 && hour < 16) return SHIFT_LABELS[0];
  if (hour >= 16 && hour < 24) return SHIFT_LABELS[1];
  return SHIFT_LABELS[2];
}

export class MockFactoryRuntime {
  private readonly now: () => number;
  private tickCount = 0;
  private agvMap = new Map<string, AgvLiveItem>();
  private alerts: SensorAlertItem[] = [];
  private timeline: EventTimelineItem[] = [];
  private sequence = 0;
  private capacityTarget = 1680;

  constructor(now: () => number = () => Date.now()) {
    this.now = now;
    this.initializeAgv();
    this.seedAlerts();
  }

  public getLines(): ProductionLine[] {
    return LINE_DEFS;
  }

  public getAgvList(params: IAgvListParams): IAgvListResponse {
    const keyword = params.keyword?.trim().toLowerCase();
    const filtered = Array.from(this.agvMap.values()).filter((agv) => {
      const passKeyword = keyword ? agv.id.toLowerCase().includes(keyword) : true;
      const passStatus = params.status ? agv.status === params.status : true;
      return passKeyword && passStatus;
    });

    const start = (params.current - 1) * params.pageSize;
    const end = start + params.pageSize;

    return {
      total: filtered.length,
      list: filtered.slice(start, end).map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        status: item.status,
        timestamp: item.timestamp,
      })),
    };
  }

  public addAgv(payload: IAddAgvPayload): IAgvData {
    const now = this.now();
    const line = pickLine(this.sequence);
    const zone = pickZone(line, this.sequence);
    const agv: AgvLiveItem = {
      id: payload.id,
      x: payload.x,
      y: payload.y,
      status: payload.status,
      timestamp: now,
      lineId: line.id,
      zoneId: zone.id,
      battery: 82,
      speed: payload.status === 'moving' ? 1.5 : 0,
      task: payload.status === 'idle' ? '待命' : '物料转运',
    };

    this.agvMap.set(agv.id, agv);
    this.pushTimeline({
      type: 'capacity-impact',
      level: 'info',
      title: `新增 AGV ${agv.id}`,
      description: `${line.name} 已接入新车辆`,
      lineId: line.id,
      agvId: agv.id,
      timestamp: now,
    });

    return {
      id: agv.id,
      x: agv.x,
      y: agv.y,
      status: agv.status,
      timestamp: agv.timestamp,
    };
  }

  public nextAgvFrame(): AgvLiveItem[] {
    this.tickCount += 1;
    const now = this.now();
    const next = new Map<string, AgvLiveItem>();
    const all = Array.from(this.agvMap.values());

    for (let i = 0; i < all.length; i += 1) {
      const agv = all[i];
      if (!agv) {
        continue;
      }
      const phase = (this.tickCount + i * 3) / 10;
      const x = clamp(agv.x + Math.cos(phase) * 6, 40, 1860);
      const y = clamp(agv.y + Math.sin(phase * 1.1) * 5, 40, 1020);
      const battery = clamp(agv.battery - 0.03, 15, 100);
      const status =
        this.alerts.some((alert) => alert.status === 'active' && alert.impactedAgvIds.includes(agv.id))
          ? 'error'
          : agv.status === 'idle' && Math.sin(phase) > 0.15
          ? 'moving'
          : agv.status;

      next.set(agv.id, {
        ...agv,
        x,
        y,
        battery: Number(battery.toFixed(1)),
        speed: status === 'moving' ? Number((1.2 + Math.abs(Math.cos(phase)) * 0.8).toFixed(2)) : 0,
        status,
        timestamp: now,
      });
    }

    this.agvMap = next;
    this.progressAlerts();

    return Array.from(this.agvMap.values());
  }

  public acknowledgeAlert(payload: AlertAcknowledgePayload): AlertAcknowledgeResult {
    const target = this.alerts.find((item) => item.id === payload.alertId);
    if (!target) {
      return {};
    }

    const now = this.now();
    target.status = 'acknowledged';
    target.acknowledgedAt = now;

    const timeline = this.pushTimeline({
      type: 'alert-ack',
      level: 'info',
      title: `告警已确认 ${target.sensorId}`,
      description: payload.note || `${payload.operator || '操作员'} 已确认并进入观察状态`,
      lineId: target.lineId,
      alertId: target.id,
      timestamp: now,
    });

    return {
      alert: { ...target },
      timeline,
    };
  }

  public simulateSensorAlert(payload?: SimulateSensorAlertPayload): SensorAlertItem {
    const now = this.now();
    const line = LINE_DEFS.find((item) => item.id === payload?.lineId) || pickLine(this.sequence);
    const severity = payload?.severity || (['high', 'critical', 'medium'][this.sequence % 3] as SensorAlertItem['severity']);
    const threshold = severity === 'critical' ? 90 : severity === 'high' ? 85 : 80;
    const value = threshold + 5 + (this.sequence % 6);
    const impactedAgvIds = Array.from(this.agvMap.values())
      .filter((agv) => agv.lineId === line.id)
      .slice(0, 2)
      .map((item) => item.id);

    const alert: SensorAlertItem = {
      id: `ALERT-${now}-${this.sequence}`,
      sensorId: payload?.sensorId || `${line.id.toUpperCase()}-SEN-${(this.sequence % 9) + 1}`,
      lineId: line.id,
      title: `${line.name}温控告警`,
      message: payload?.message || `${line.name} 温控超阈值，建议检查冷却回路`,
      severity,
      threshold,
      value,
      impactedAgvIds,
      suggestion: '先确认告警，再转后台查看传感器趋势',
      status: 'active',
      timestamp: now,
    };

    this.alerts.unshift(alert);
    this.sequence += 1;
    this.pushTimeline({
      type: 'sensor-alert',
      level: severity === 'critical' ? 'critical' : 'warning',
      title: alert.title,
      description: `${alert.message}（当前值 ${alert.value}）`,
      lineId: line.id,
      alertId: alert.id,
      timestamp: now,
    });

    return { ...alert };
  }

  public getAlerts(filters?: DashboardFilters): SensorAlertItem[] {
    return this.alerts.filter((alert) => {
      if (filters?.lineId && filters.lineId !== 'all' && alert.lineId !== filters.lineId) {
        return false;
      }
      return alert.status !== 'resolved';
    });
  }

  public getTimeline(filters?: DashboardFilters): EventTimelineItem[] {
    return this.timeline.filter((item) => {
      if (filters?.lineId && filters.lineId !== 'all' && item.lineId !== filters.lineId) {
        return false;
      }
      return true;
    });
  }

  public getCapacitySummary(filters?: DashboardFilters): CapacitySummary {
    const now = this.now();
    const allAgv = this.getAgvByFilters(filters);
    const activeAlerts = this.getAlerts(filters).filter((item) => item.status === 'active');
    const onlineCount = allAgv.filter((agv) => agv.status !== 'error').length;
    const jitter = Math.round(Math.sin(this.tickCount / 8) * 36);
    const actual = Math.max(0, this.capacityTarget - activeAlerts.length * 55 + jitter);

    return {
      target: this.capacityTarget,
      actual,
      completionRate: Number((actual / this.capacityTarget).toFixed(3)),
      onlineRate: Number((onlineCount / Math.max(1, allAgv.length)).toFixed(3)),
      alertCount: activeAlerts.length,
      affectedRate: Number((activeAlerts.length / Math.max(1, allAgv.length)).toFixed(3)),
      shift: filters?.shift || pickShift(now),
      timestamp: now,
    };
  }

  public getAgvByFilters(filters?: DashboardFilters): AgvLiveItem[] {
    const all = Array.from(this.agvMap.values());
    if (!filters?.lineId || filters.lineId === 'all') {
      return all;
    }
    return all.filter((agv) => agv.lineId === filters.lineId);
  }

  public replaceAgvByApi(rawAgvList: IAgvData[]): void {
    if (!rawAgvList.length) {
      return;
    }
    const next = new Map<string, AgvLiveItem>();
    for (let i = 0; i < rawAgvList.length; i += 1) {
      const agv = rawAgvList[i];
      if (!agv) {
        continue;
      }
      const line = pickLine(i);
      const zone = pickZone(line, i);
      next.set(agv.id, {
        id: agv.id,
        x: agv.x,
        y: agv.y,
        status: agv.status,
        timestamp: agv.timestamp,
        lineId: line.id,
        zoneId: zone.id,
        battery: Number((70 + ((i * 7) % 30)).toFixed(1)),
        speed: agv.status === 'moving' ? 1.6 : 0,
        task: agv.status === 'moving' ? '成品入库' : '待命',
      });
    }
    this.agvMap = next;
  }

  private initializeAgv(): void {
    let index = 0;
    const now = this.now();
    for (let lineIndex = 0; lineIndex < LINE_DEFS.length; lineIndex += 1) {
      const line = pickLine(lineIndex);
      for (let i = 0; i < 18; i += 1) {
        const zone = pickZone(line, i);
        const agvId = `AGV-${String(index + 1).padStart(3, '0')}`;
        const agv: AgvLiveItem = {
          id: agvId,
          x: zone.x + 40 + (i % 6) * 84,
          y: zone.y + 60 + Math.floor(i / 6) * 66,
          status: i % 11 === 0 ? 'error' : i % 2 === 0 ? 'moving' : 'idle',
          timestamp: now,
          lineId: line.id,
          zoneId: zone.id,
          battery: Number((78 + (i % 20)).toFixed(1)),
          speed: i % 2 === 0 ? 1.6 : 0,
          task: i % 3 === 0 ? '工位补料' : '成品转运',
        };
        this.agvMap.set(agv.id, agv);
        index += 1;
      }
    }
  }

  private seedAlerts(): void {
    this.simulateSensorAlert({
      lineId: 'line-a',
      sensorId: 'LINE-A-SEN-2',
      severity: 'high',
      message: '冲压区温控偏高，疑似冷却负载过大',
    });
    this.simulateSensorAlert({
      lineId: 'line-b',
      sensorId: 'LINE-B-SEN-4',
      severity: 'medium',
      message: '焊接区振动波动接近阈值',
    });
  }

  private progressAlerts(): void {
    if (this.tickCount % 48 === 0) {
      this.simulateSensorAlert();
    }

    if (this.tickCount % 72 === 0) {
      const acked = this.alerts.find((item) => item.status === 'acknowledged');
      if (acked) {
        acked.status = 'resolved';
        this.pushTimeline({
          type: 'capacity-impact',
          level: 'info',
          title: `${acked.sensorId} 已恢复`,
          description: '系统检测恢复到安全范围，告警已自动关闭',
          lineId: acked.lineId,
          alertId: acked.id,
          timestamp: this.now(),
        });
      }
    }
  }

  private pushTimeline(
    input: Omit<EventTimelineItem, 'id'>
  ): EventTimelineItem {
    const item: EventTimelineItem = {
      ...input,
      id: `EVT-${input.timestamp}-${this.sequence}-${this.timeline.length}`,
    };
    this.timeline.unshift(item);
    this.timeline = this.timeline.slice(0, 80);
    return item;
  }
}
