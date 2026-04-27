/**
 * @packages/shared 统一入口
 * 文件职责：对外聚合监控、网络、实时通信和数据提供器能力。
 */

// Monitor SDK
export { initMonitor } from '@packages/monitor';
export type { MonitorConfig } from '@packages/monitor';

// Network 能力（query client、API、hooks、类型）
export * from './network';

// WebSocket/实时同步能力
export * from './websocket';

// 统一数据提供器能力（auto/api/mock）
export * from './provider';

// 反馈系统（toast、notification、confirm）
export { toast, notify, confirm, feedbackService } from './feedback';
export type { ToastOptions, NotificationOptions, ConfirmOptions } from './feedback';

// Composables
export { useFeedback } from './composables/useFeedback';

// 加载组件
export { default as SkeletonTable } from './components/loading/SkeletonTable.vue';
export { default as SkeletonCard } from './components/loading/SkeletonCard.vue';
export { default as SkeletonChart } from './components/loading/SkeletonChart.vue';

// 空状态组件
export { default as EmptyState } from './components/empty/EmptyState.vue';
export { default as NoResults } from './components/empty/NoResults.vue';
export { default as NetworkError } from './components/empty/NetworkError.vue';

// 认证和权限系统
export * from './auth';
