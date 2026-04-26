/**
 * 反馈系统类型定义
 */

export interface ToastOptions {
  content: string;
  duration?: number;
  onClose?: () => void;
}

export interface NotificationOptions {
  message: string;
  description?: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClose?: () => void;
}

export interface ConfirmOptions {
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ProgressOptions {
  percent: number;
  status?: 'success' | 'exception' | 'active' | 'normal';
  showInfo?: boolean;
}
