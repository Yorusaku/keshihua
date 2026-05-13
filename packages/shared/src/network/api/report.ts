import { apiGet, isMockMode } from "../api-client";

export interface ICapacityReportData {
  factory: string;
  line: string;
  date: string;
  yield: number;
  defectRate: number;
}

export interface ICapacityReportParams {
  factory?: string;
  line?: string;
  date?: string;
}

const factories = ["Factory-A", "Factory-B", "Factory-C"];
const lines = ["Line-1", "Line-2", "Line-3", "Line-4"];
const dates = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return date.toISOString().split("T")[0] || "";
});

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] || "";
}

export function generateCapacityReportData(count: number = 1000): ICapacityReportData[] {
  const data: ICapacityReportData[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      factory: pickRandom(factories),
      line: pickRandom(lines),
      date: pickRandom(dates),
      yield: Math.floor(Math.random() * 10000) + 1000,
      defectRate: Number((Math.random() * 0.1).toFixed(3)),
    });
  }
  return data;
}

let mockReportData: ICapacityReportData[] | null = null;

export function getMockReportData(): ICapacityReportData[] {
  if (!mockReportData) mockReportData = generateCapacityReportData();
  return mockReportData;
}

export async function fetchCapacityReport(params?: ICapacityReportParams): Promise<ICapacityReportData[]> {
  if (!isMockMode()) {
    try {
      return await apiGet<ICapacityReportData[]>("/capacity/report", params);
    } catch {
      // API 失败回退 mock
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  let data = getMockReportData();
  if (params?.factory) data = data.filter((d) => d.factory === params.factory);
  if (params?.line) data = data.filter((d) => d.line === params.line);
  if (params?.date) data = data.filter((d) => d.date === params.date);
  return data;
}
