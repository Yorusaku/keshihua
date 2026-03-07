/**
 * Types 类型定义
 * 阶段：🟣 重构阶段（配置化驱动）
 */

import type { RouteMeta } from 'vue-router';

/**
 * 📌 扩展 vue-router 的 RouteMeta 接口
 * @description 显式声明自定义属性，杜绝隐式 any
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string;
    /** 图标名称（element-plus 图标） */
    icon?: string;
    /** 是否在侧边栏显示 */
    hidden?: boolean;
    /** 菜单排序权重 */
    weight?: number;
  }
}

/**
 * 📌 路由配置项类型
 */
export interface AppRouteRecordRaw {
  /** 路径 */
  path: string;
  /** 路由名称 */
  name?: string;
  /** 组件 */
  component?: any;
  /** 重定向 */
  redirect?: string;
  /** 子路由 */
  children?: AppRouteRecordRaw[];
  /** 元信息 */
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    weight?: number;
  };
}

/**
 * 📌 侧边栏菜单项类型
 */
export interface SidebarMenuItem {
  /** 路由路径 */
  path: string;
  /** 菜单名称 */
  title: string;
  /** 图标名称 */
  icon?: string;
}
