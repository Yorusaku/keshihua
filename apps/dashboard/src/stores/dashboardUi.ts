/**
 * Dashboard UI 状态存储
 * 文件职责：维护筛选项、聚焦对象、详情抽屉状态和深链上下文。
 */

import { defineStore } from 'pinia';
import type { DashboardFilters } from '@packages/shared';

export interface DashboardDeepLinkContext {
  lineId?: string;
  agvId?: string;
  sensorId?: string;
  alertId?: string;
  shift?: string;
  source?: string;
}

interface DashboardUiState {
  filters: DashboardFilters;
  focusedAgvId: string | null;
  selectedAlertId: string | null;
  detailDrawerOpen: boolean;
  deepLinkContext: DashboardDeepLinkContext;
}

export const useDashboardUiStore = defineStore('dashboard-ui', {
  state: (): DashboardUiState => ({
    filters: {
      lineId: 'all',
      shift: '白班',
      timeRange: '1h',
    },
    focusedAgvId: null,
    selectedAlertId: null,
    detailDrawerOpen: false,
    deepLinkContext: {},
  }),
  actions: {
    updateFilters(partial: Partial<DashboardFilters>) {
      this.filters = {
        ...this.filters,
        ...partial,
      };
    },
    focusAgv(agvId: string | null) {
      this.focusedAgvId = agvId;
      if (agvId) {
        this.deepLinkContext.agvId = agvId;
      }
    },
    openAlertDetail(alertId: string) {
      this.selectedAlertId = alertId;
      this.detailDrawerOpen = true;
      this.deepLinkContext.alertId = alertId;
    },
    closeAlertDetail() {
      this.detailDrawerOpen = false;
    },
    setDeepLinkContext(context: DashboardDeepLinkContext) {
      this.deepLinkContext = {
        ...this.deepLinkContext,
        ...context,
      };
    },
  },
});
