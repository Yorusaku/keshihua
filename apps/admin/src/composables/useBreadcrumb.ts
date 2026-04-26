/**
 * useBreadcrumb - 面包屑逻辑 Composable
 * 阶段：🟣 重构阶段（配置化驱动）
 *
 * 📌 功能：
 * - 使用 useRoute().matched 动态生成当前路由的面包屑层级数组
 * - 从路由的 meta.title 中提取面包屑文本
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';

/**
 * 📌 面包屑项类型
 */
export interface BreadcrumbItem {
  /** 路由路径 */
  path: string;
  /** 面包屑文本 */
  title: string;
  /** 是否为最后一个（当前路由） */
  active: boolean;
}

/**
 * useBreadcrumb - 获取当前路由的面包屑配置
 * @description 动态生成面包屑层级数组，支持嵌套路由
 */
export function useBreadcrumb() {
  const route = useRoute();

  /**
   * 📌 面包屑列表
   * @description 从 route.matched 中提取所有 matched 路由的 meta.title
   */
  const breadcrumbList = computed(() => {
    // 过滤掉重定向路由和空标题路由
    return route.matched
      .filter((match) => {
        // ❌ 修复：禁止使用 match.route，直接访问 match 对象
        // 排除根路径 '/'（通常不需要显示）
        return match.path !== '/' && match.meta?.title;
      })
      .map((match, index, array) => {
        // ❌ 修复：禁止使用 match.route，直接访问 match 对象
        return {
          path: match.path,
          title: match.meta?.title || '',
          active: index === array.length - 1,
        } as BreadcrumbItem;
      });
  });

  return {
    breadcrumbList,
  };
}
