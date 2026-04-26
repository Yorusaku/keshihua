/**
 * 表格导出 Composable
 * 提供 CSV 导出功能
 */

export interface ExportColumn {
  title: string;
  dataIndex: string;
  format?: (value: any, record: any) => string;
}

export function useTableExport() {
  /**
   * 导出为 CSV
   * @param data 数据数组
   * @param columns 列配置
   * @param filename 文件名
   */
  const exportToCSV = (
    data: any[],
    columns: ExportColumn[],
    filename = 'export'
  ): void => {
    // 构建 CSV 头部
    const headers = columns.map(col => col.title).join(',');

    // 构建 CSV 行
    const rows = data.map(row => {
      return columns.map(col => {
        let value = row[col.dataIndex];

        // 如果有格式化函数，使用格式化后的值
        if (col.format) {
          value = col.format(value, row);
        }

        // 处理包含逗号、换行或引号的值
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }

        return value ?? '';
      }).join(',');
    });

    // 合并头部和行
    const csv = [headers, ...rows].join('\n');

    // 创建 Blob 并下载（添加 BOM 以支持中文）
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportToCSV,
  };
}
