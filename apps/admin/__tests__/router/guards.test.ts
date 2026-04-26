import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { setupRouterGuards } from '@/router/guards';

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/agv',
        name: 'Agv',
        component: { template: '<div>agv</div>' },
        meta: { title: 'AGV 管理' },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: { template: '<div>404</div>' },
      },
    ],
  });
  setupRouterGuards(router);
  return router;
}

describe('setupRouterGuards', () => {
  afterEach(() => {
    document.title = '';
  });

  it('进入页面后应更新标题', async () => {
    const router = createTestRouter();
    await router.push('/agv');
    await router.isReady();
    expect(document.title).toBe('AGV 管理 | 智造远望 · Admin');
  });

  it('访问非法路由时应重定向到 /agv 并保留上下文参数', async () => {
    const router = createTestRouter();
    await router.push('/abc?lineId=line-a&alertId=ALERT-1&invalidKey=foo');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/agv');
    expect(router.currentRoute.value.query.lineId).toBe('line-a');
    expect(router.currentRoute.value.query.alertId).toBe('ALERT-1');
    expect(router.currentRoute.value.query.invalidKey).toBeUndefined();
  });
});
