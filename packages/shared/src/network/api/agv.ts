/**
 * AGV 网络 API
 * 文件路径：packages/shared/src/network/api/agv.ts
 * 阶段：🔴 红灯阶段（占位文件）
 *
 * 📌 功能说明：
 * - IAgvListParams：AGV 列表查询参数接口
 * - IAgvListResponse：AGV 列表响应接口
 * - fetchAgvList：AGV 列表 Mock 请求函数（500ms 延迟 + 20条数据）
 * - IAddAgvPayload：AGV 新增入参接口
 * - addAgv：AGV 新增 Mock 函数（占位，抛出错误）
 */

import type { IAgvData } from '@/websocket/types';

/**
 * 📌 AGV 列表查询参数接口
 */
export interface IAgvListParams {
  current: number;     // 当前页码（从 1 开始）
  pageSize: number;    // 每页条数
  keyword?: string;    // 搜索关键字（车号模糊匹配）
  status?: string;     // AGV 状态过滤（idle / moving / error）
}

/**
 * 📌 AGV 列表响应接口
 */
export interface IAgvListResponse {
  total: number;       // 总数据条数
  list: IAgvData[];    // 当前页数据列表
}

/**
 * 📌 AGV 列表 Mock 数据（20条固定数据）
 * @description 包含不同状态和坐标的 AGV 数据
 */
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

/**
 * 📌 AGV 列表 Mock 请求函数（绿灯实现）
 * @description 实现 Mock API 逻辑：500ms延迟 + 过滤 + 分页
 * @param params 查询参数
 * @returns Mock 响应数据
 */
export async function fetchAgvList(params: IAgvListParams): Promise<IAgvListResponse> {
  // ✅ 模拟 500ms 网络延迟（提升用户体验感知）
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // ✅ 步骤1： initial filtering with all data
  let filtered = mockAgvData;
  
  // ✅ 步骤2：关键字过滤（车号模糊匹配，忽略大小写）
  if (params.keyword && params.keyword.trim() !== '') {
    filtered = filtered.filter(d => 
      d.id.toLowerCase().includes(params.keyword!.toLowerCase().trim())
    );
  }
  
  // ✅ 步骤3：状态过滤
  if (params.status && params.status.trim() !== '') {
    filtered = filtered.filter(d => d.status === params.status);
  }
  
  // ✅ 步骤4：分页切片
  const total = filtered.length;
  const start = (params.current - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paginated = filtered.slice(start, end);
  
  // ✅ 返回结果
  return {
    total,
    list: paginated,
  };
}

/**
 * 📌 AGV 新增入参接口（蓝灯设计）
 */
export interface IAddAgvPayload {
  id: string;          // 车号（格式：AGV-XXX）
  x: number;           // X 坐标
  y: number;           // Y 坐标
  status: 'idle' | 'moving' | 'error';  // 状态枚举
}

/**
 * 📌 AGV 新增 Mock 函数（占位）
 * @description 红灯阶段：未实现，直接抛出错误
 * @param payload 新增数据入参
 * @returns 新增的 AGV 数据
 */
export async function addAgv(payload: IAddAgvPayload): Promise<IAgvData> {
  throw new Error('Function addAgv is not implemented yet');
}

