import type { IAgvData } from '../../websocket/types';
import { agvSyncBus } from '../../websocket/AgvSyncBus';
import { getDomainRealtimeBus } from '../../websocket/realtime';
import {
  createRealtimeMessageId,
  createRealtimeSourceId,
  type RealtimeEnvelope,
} from '../../websocket/realtime.types';

export interface IAgvListParams {
  current: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

export interface IAgvListResponse {
  total: number;
  list: IAgvData[];
}

const mockAgvData: IAgvData[] = [
  { id: 'AGV-001', x: 120.5, y: 340.2, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-002', x: 800.1, y: 150.8, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-003', x: 450.0, y: 900.0, status: 'error', timestamp: Date.now() },
  { id: 'AGV-004', x: 320.4, y: 110.2, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-005', x: 90.0, y: 80.0, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-006', x: 560.2, y: 450.5, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-007', x: 720.8, y: 280.3, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-008', x: 180.3, y: 620.9, status: 'error', timestamp: Date.now() },
  { id: 'AGV-009', x: 410.7, y: 390.1, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-010', x: 650.0, y: 520.4, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-011', x: 230.5, y: 750.2, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-012', x: 890.1, y: 180.7, status: 'error', timestamp: Date.now() },
  { id: 'AGV-013', x: 360.4, y: 420.8, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-014', x: 510.9, y: 680.3, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-015', x: 740.2, y: 250.6, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-016', x: 170.7, y: 590.0, status: 'error', timestamp: Date.now() },
  { id: 'AGV-017', x: 420.0, y: 840.5, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-018', x: 680.3, y: 310.2, status: 'moving', timestamp: Date.now() },
  { id: 'AGV-019', x: 290.6, y: 470.9, status: 'idle', timestamp: Date.now() },
  { id: 'AGV-020', x: 830.8, y: 140.4, status: 'error', timestamp: Date.now() },
];

const localSourceId = createRealtimeSourceId('agv-api');

export async function fetchAgvList(params: IAgvListParams): Promise<IAgvListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = mockAgvData;
  if (params.keyword && params.keyword.trim() !== '') {
    const keyword = params.keyword.trim().toLowerCase();
    filtered = filtered.filter((d) => d.id.toLowerCase().includes(keyword));
  }
  if (params.status && params.status.trim() !== '') {
    filtered = filtered.filter((d) => d.status === params.status);
  }

  const total = filtered.length;
  const start = (params.current - 1) * params.pageSize;
  const end = start + params.pageSize;
  return {
    total,
    list: filtered.slice(start, end),
  };
}

export interface IAddAgvPayload {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'moving' | 'error';
}

export async function addAgv(payload: IAddAgvPayload): Promise<IAgvData> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newAgv: IAgvData = {
    id: payload.id,
    x: payload.x,
    y: payload.y,
    status: payload.status,
    timestamp: Date.now(),
  };

  mockAgvData.unshift(newAgv);

  const envelope: RealtimeEnvelope<IAgvData> = {
    messageId: createRealtimeMessageId('agv'),
    topic: 'agv.created' as const,
    sourceId: localSourceId,
    timestamp: Date.now(),
    payload: newAgv,
  };
  agvSyncBus.broadcastNewAgvEnvelope(envelope);
  getDomainRealtimeBus().publishEnvelope(envelope);

  return newAgv;
}

export { mockAgvData };
