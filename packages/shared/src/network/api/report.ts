/**
 * report API - 产能透视报表
 * 文件路径：packages/shared/src/network/api/report.ts
 * 阶段：🟢 绿灯阶段（业务实现）
 *
 * 📌 核心功能：
 * - generateCapacityReportData：生成 1000+ 条打平 Mock 数据
 * - fetchCapacityReport：异步 API + 500ms 延迟 + 过滤逻辑
 */

/**
 * 📌 产能报表数据接口
 */
export interface ICapacityReportData {
  factory: string;      // 工厂（维度）
  line: string;         // 产线（维度）
  date: string;         // 日期（维度）
  yield: number;        // 产量（指标）
  defectRate: number;   // 不良率（指标）
}

/**
 * 📌 产能报表查询参数接口
 */
export interface ICapacityReportParams {
  factory?: string;  // 工厂过滤
  line?: string;     // 产线过滤
  date?: string;     // 日期过滤
}

/**
 * 📌 Mock 数据工厂
 * @description 生成 1000 条打平数据
 */
const factories = ['Factory-A', 'Factory-B', 'Factory-C'];
const lines = ['Line-1', 'Line-2', 'Line-3', 'Line-4'];
const dates = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return date.toISOString().split('T')[0] || '';
});

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] || '';
}

/**
 * 📌 生成海量 Mock 数据（1000 条）
 * @description 使用 for 循环动态生成打平数据
 * @param count 数据数量（默认 1000）
 * @returns ICapacityReportData[]
 */
export function generateCapacityReportData(count: number = 1000): ICapacityReportData[] {
  const data: ICapacityReportData[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      factory: pickRandom(factories),
      line: pickRandom(lines),
      date: pickRandom(dates),
      yield: Math.floor(Math.random() * 10000) + 1000,  // 1000 ~ 11000
      defectRate: Number((Math.random() * 0.1).toFixed(3)),  // 0.000 ~ 0.100
    });
  }

  return data;
}

/**
 * 📌 Mock 数据缓存（避免重复生成）
 */
let mockReportData: ICapacityReportData[] | null = null;

/**
 * 📌 获取 Mock 数据（带缓存）
 */
export function getMockReportData(): ICapacityReportData[] {
  if (!mockReportData) {
    mockReportData = generateCapacityReportData();
  }
  return mockReportData;
}

/**
 * 📌 产能报表查询 API
 * @description 返回打平数据（S2 需要的格式）
 * @param params 查询参数（可选）
 * @returns ICapacityReportData[]
 */
export async function fetchCapacityReport(
  params?: ICapacityReportParams
): Promise<ICapacityReportData[]> {
  // ✅ 模拟 500ms 网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // ✅ 获取 Mock 数据
  let data = getMockReportData();

  // ✅ 工厂过滤
  if (params?.factory) {
    data = data.filter(d => d.factory === params.factory);
  }

  // ✅ 产线过滤
  if (params?.line) {
    data = data.filter(d => d.line === params.line);
  }

  // ✅ 日期过滤
  if (params?.date) {
    data = data.filter(d => d.date === params.date);
  }

  return data;
}
