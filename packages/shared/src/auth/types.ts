/**
 * 用户和权限类型定义
 */

export type UserRole =
  | 'admin'                    // 系统管理员
  | 'device_engineer'          // 设备工程师
  | 'electrical_engineer'      // 电气工程师
  | 'maintenance_technician'   // 维修技师
  | 'quality_engineer'         // 质量工程师
  | 'process_engineer'         // 工艺工程师
  | 'viewer';                  // 只读用户

export type PermissionAction =
  | 'view'      // 查看
  | 'create'    // 创建
  | 'edit'      // 编辑
  | 'delete'    // 删除
  | 'assign'    // 分配（告警）
  | 'close'     // 关闭（告警）
  | 'export';   // 导出（报表）

export interface Permission {
  resource: string;
  actions: PermissionAction[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTime?: number;
  expiresAt?: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
