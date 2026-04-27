/**
 * 告警处理中心状态管理
 * 文件职责：管理告警列表、统计数据、查询参数和 UI 状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  SensorAlertItem,
  AlertQueryParams,
  AlertStatistics,
  AlertAssignee,
  AssignAlertPayload,
  UpdateAlertProcessPayload,
  CloseAlertPayload,
  DashboardFilters,
} from '@packages/shared';
import { getSharedProvider } from '@/composables';
import { alertSyncBus } from '@packages/shared';

export const useAlertCenterStore = defineStore('alertCenter', () => {
  // 获取数据提供器
  function getProvider() {
    const provider = getSharedProvider();
    if (!provider) {
      throw new Error('Data provider not initialized');
    }
    return provider;
  }

  // 状态
  const alerts = ref<SensorAlertItem[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const statistics = ref<AlertStatistics | null>(null);
  const assignees = ref<AlertAssignee[]>([]);
  const selectedAlertId = ref<string | null>(null);
  const detailDrawerOpen = ref(false);
  const assignModalOpen = ref(false);

  // 查询参数
  const queryParams = ref<AlertQueryParams>({
    current: 1,
    pageSize: 20,
  });

  // 计算属性
  const selectedAlert = computed(() => {
    if (!selectedAlertId.value) return null;
    return alerts.value.find((a) => a.id === selectedAlertId.value) || null;
  });

  // 获取告警列表
  async function fetchAlerts() {
    loading.value = true;
    try {
      const provider = getProvider();
      const result = await provider.getAlertHistory(queryParams.value);
      alerts.value = result.list;
      total.value = result.total;
    } finally {
      loading.value = false;
    }
  }

  // 获取统计数据
  async function fetchStatistics(filters?: DashboardFilters) {
    try {
      const provider = getProvider();
      statistics.value = await provider.getAlertStatistics(filters);
    } catch (error) {
      console.error('Failed to fetch alert statistics:', error);
    }
  }

  // 获取责任人列表
  async function fetchAssignees() {
    try {
      const provider = getProvider();
      assignees.value = await provider.getAssignees();
    } catch (error) {
      console.error('Failed to fetch assignees:', error);
    }
  }

  // 分配告警
  async function assignAlert(payload: AssignAlertPayload) {
    try {
      const provider = getProvider();
      const result = await provider.assignAlert(payload);
      if (result.alert) {
        updateAlertInList(result.alert);
        alertSyncBus.broadcastAlertAssigned(result.alert);
      }
      return result;
    } catch (error) {
      console.error('Failed to assign alert:', error);
      throw error;
    }
  }

  // 更新处理记录
  async function updateProcess(payload: UpdateAlertProcessPayload) {
    try {
      const provider = getProvider();
      const result = await provider.updateAlertProcess(payload);
      if (result.alert) {
        updateAlertInList(result.alert);
        alertSyncBus.broadcastAlertUpdated(result.alert);
      }
      return result;
    } catch (error) {
      console.error('Failed to update alert process:', error);
      throw error;
    }
  }

  // 关闭告警
  async function closeAlert(payload: CloseAlertPayload) {
    try {
      const provider = getProvider();
      const result = await provider.closeAlert(payload);
      if (result.alert) {
        updateAlertInList(result.alert);
        alertSyncBus.broadcastAlertClosed(result.alert);
      }
      return result;
    } catch (error) {
      console.error('Failed to close alert:', error);
      throw error;
    }
  }

  // 更新列表中的告警
  function updateAlertInList(alert: SensorAlertItem) {
    const index = alerts.value.findIndex((a) => a.id === alert.id);
    if (index !== -1) {
      alerts.value[index] = alert;
    }
  }

  // 打开告警详情
  function openAlertDetail(alertId: string) {
    selectedAlertId.value = alertId;
    detailDrawerOpen.value = true;
  }

  // 关闭告警详情
  function closeAlertDetail() {
    detailDrawerOpen.value = false;
    selectedAlertId.value = null;
  }

  // 打开分配对话框
  function openAssignModal(alertId: string) {
    selectedAlertId.value = alertId;
    assignModalOpen.value = true;
  }

  // 关闭分配对话框
  function closeAssignModal() {
    assignModalOpen.value = false;
    selectedAlertId.value = null;
  }

  // 更新查询参数
  function updateQueryParams(params: Partial<AlertQueryParams>) {
    queryParams.value = { ...queryParams.value, ...params };
  }

  // 重置查询参数
  function resetQueryParams() {
    queryParams.value = {
      current: 1,
      pageSize: 20,
    };
  }

  // 订阅跨端同步事件
  function subscribeAlertEvents() {
    const unsubscribeAssigned = alertSyncBus.subscribeAlertAssigned((alert) => {
      updateAlertInList(alert);
    });

    const unsubscribeUpdated = alertSyncBus.subscribeAlertUpdated((alert) => {
      updateAlertInList(alert);
    });

    const unsubscribeClosed = alertSyncBus.subscribeAlertClosed((alert) => {
      updateAlertInList(alert);
    });

    return () => {
      unsubscribeAssigned();
      unsubscribeUpdated();
      unsubscribeClosed();
    };
  }

  return {
    // 状态
    alerts,
    total,
    loading,
    statistics,
    assignees,
    selectedAlertId,
    detailDrawerOpen,
    assignModalOpen,
    queryParams,
    selectedAlert,

    // 方法
    fetchAlerts,
    fetchStatistics,
    fetchAssignees,
    assignAlert,
    updateProcess,
    closeAlert,
    openAlertDetail,
    closeAlertDetail,
    openAssignModal,
    closeAssignModal,
    updateQueryParams,
    resetQueryParams,
    subscribeAlertEvents,
  };
});
