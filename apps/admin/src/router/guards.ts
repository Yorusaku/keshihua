/**
 * Admin 路由守卫
 * 文件职责：设置页面标题、非法路由兜底，并保留上下文查询参数。
 */

import type { Router } from 'vue-router';

const APP_TITLE = '智造远望 · Admin';

function normalizeContextQuery(query: Record<string, unknown>): Record<string, string> {
  const contextKeys = ['lineId', 'agvId', 'sensorId', 'alertId', 'shift', 'source'];
  const normalized: Record<string, string> = {};
  for (let i = 0; i < contextKeys.length; i += 1) {
    const key = contextKeys[i];
    if (!key) {
      continue;
    }
    const value = query[key];
    if (typeof value === 'string' && value) {
      normalized[key] = value;
    }
  }
  return normalized;
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    if (to.name === 'NotFound') {
      return {
        path: '/agv',
        query: normalizeContextQuery(to.query as Record<string, unknown>),
        replace: true,
      };
    }
    return true;
  });

  router.afterEach((to) => {
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : '工作台';
    document.title = `${pageTitle} | ${APP_TITLE}`;
  });
}
