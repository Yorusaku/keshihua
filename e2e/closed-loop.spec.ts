import { test, expect, type Page } from '@playwright/test';

const ADMIN = { username: 'admin', password: '123456' };

async function loginDashboard(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[placeholder="请输入用户名"]', ADMIN.username);
  await page.fill('input[placeholder="请输入密码"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/', { timeout: 15000 });
}

async function loginAdmin(page: Page): Promise<void> {
  await page.goto('http://localhost:5174/login');
  await page.fill('input[placeholder="请输入用户名"]', ADMIN.username);
  await page.fill('input[placeholder="请输入密码"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5174/agv', { timeout: 15000 });
}

async function getAuthToken(page: Page): Promise<string> {
  const token = await page.evaluate(
    () => sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
  );
  expect(token).toBeTruthy();
  return token as string;
}

async function readOnlineAgvCount(page: Page): Promise<number> {
  const text = await page.locator('.stage-overview p', { hasText: '在线 AGV' }).innerText();
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : NaN;
}

test.describe('真实模式断网行为', () => {
  test('Dashboard 数据接口失败时显示错误且不展示 mock 数据', async ({ page }) => {
    await loginDashboard(page);
    await expect(page.locator('.metric-chip', { hasText: '数据源' }).locator('strong')).toHaveText('真实接口', {
      timeout: 15000,
    });

    await page.route('**/api/agvs**', (route) => route.abort());
    await page.route('**/api/alerts**', (route) => route.abort());
    await page.reload();

    await expect(page.locator('.stage-mask--error')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.metric-chip', { hasText: '数据源' }).locator('strong')).toHaveText('--');
    await expect(page.locator('.intel-panel__alerts .alert-card')).toHaveCount(0);
  });

  test('Admin AGV 列表接口失败时显示错误且不填充 mock 数据', async ({ page }) => {
    await page.route('**/api/agvs**', (route) => route.abort());
    await loginAdmin(page);

    await expect(page.locator('.ant-message-error')).toContainText('获取列表失败', { timeout: 15000 });
    await expect(page.locator('.agv-page')).not.toContainText('AGV-001');
  });
});

test.describe('WebSocket 跨窗口闭环', () => {
  test('Admin 新增 AGV 后 Dashboard 收到实时广播并更新数量', async ({ browser, request }) => {
    const adminContext = await browser.newContext();
    const dashboardContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const dashboardPage = await dashboardContext.newPage();

    const receivedFrames: string[] = [];
    dashboardPage.on('websocket', (socket) => {
      socket.on('framereceived', (event) => {
        receivedFrames.push(String(event.payload));
      });
    });

    let createdId: string | null = null;
    try {
      await loginAdmin(adminPage);
      await loginDashboard(dashboardPage);
      await expect(dashboardPage.locator('.stage-overview')).toBeVisible({ timeout: 15000 });

      const token = await getAuthToken(adminPage);
      const headers = { Authorization: `Bearer ${token}` };
      const beforeRes = await request.get('http://127.0.0.1:8091/api/agvs?current=1&pageSize=300', { headers });
      expect(beforeRes.ok()).toBeTruthy();
      const beforeIds: string[] = (await beforeRes.json()).list.map((item: { id: string }) => item.id);
      await expect.poll(() => readOnlineAgvCount(dashboardPage), { timeout: 15000 }).toBeGreaterThan(0);
      const beforeCount = await readOnlineAgvCount(dashboardPage);

      await adminPage.getByRole('button', { name: '新增模拟车辆' }).click();
      await expect(adminPage.locator('.ant-message-success', { hasText: '添加成功' })).toBeVisible({ timeout: 15000 });

      await expect
        .poll(() => receivedFrames.some((frame) => frame.includes('agv.created')), { timeout: 10000 })
        .toBe(true);

      await expect
        .poll(() => readOnlineAgvCount(dashboardPage), { timeout: 15000 })
        .toBe(beforeCount + 1);

      await expect
        .poll(async () => {
          const res = await request.get('http://127.0.0.1:8091/api/agvs?current=1&pageSize=300', { headers });
          const list = await res.json();
          const ids: string[] = list.list.map((item: { id: string }) => item.id);
          createdId = ids.find((id) => !beforeIds.includes(id)) ?? null;
          return createdId;
        }, { timeout: 10000 })
        .not.toBeNull();
    } finally {
      try {
        if (createdId) {
          const token = await getAuthToken(adminPage);
          await request.delete(`http://127.0.0.1:8091/api/agvs/${createdId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } finally {
        await adminContext.close();
        await dashboardContext.close();
      }
    }
  });

  test('Admin 指派并关闭告警后 Dashboard 实时同步处理进度', async ({ browser, request }) => {
    const adminContext = await browser.newContext();
    const dashboardContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const dashboardPage = await dashboardContext.newPage();

    const stamp = Date.now();
    const sensorId = `E2E-ALERT-${stamp}`;
    const alertTitle = `E2E 告警闭环 ${stamp}`;
    const resolution = `E2E 已恢复 ${stamp}`;

    try {
      await loginAdmin(adminPage);
      const token = await getAuthToken(adminPage);
      const headers = { Authorization: `Bearer ${token}` };

      const createRes = await request.post('http://127.0.0.1:8091/api/alerts', {
        headers,
        data: {
          sensorId,
          lineId: 'line-a',
          title: alertTitle,
          message: 'E2E 临时告警，用于验证指派和关闭同步',
          severity: 'high',
          threshold: 80,
          value: 95,
          impactedAgvIds: [],
          suggestion: '检查设备温度',
        },
      });
      expect(createRes.ok()).toBeTruthy();

      await loginDashboard(dashboardPage);
      const dashboardCard = dashboardPage.locator('.alert-card', { hasText: alertTitle });
      await expect(dashboardCard).toBeVisible({ timeout: 15000 });
      await expect(dashboardCard).toContainText('未分配');

      await adminPage.goto('http://localhost:5174/agv/alert-center');
      const row = adminPage.locator('tr', { hasText: sensorId });
      await expect(row).toBeVisible({ timeout: 15000 });

      await row.getByRole('button', { name: '分配' }).click();
      const assignModal = adminPage.locator('.ant-modal-wrap:visible', { hasText: '分配告警' });
      await expect(assignModal).toBeVisible();
      await assignModal.locator('.ant-select').click();
      await adminPage.locator('.ant-select-item-option', { hasText: '张工' }).click();
      await assignModal.locator('.ant-modal-footer .ant-btn-primary').click();

      await expect(adminPage.locator('.ant-message-success', { hasText: '分配成功' })).toBeVisible({
        timeout: 15000,
      });
      await expect(row).toContainText('已分配');
      await expect(row).toContainText('张工');

      await expect(dashboardCard).toContainText('已分配', { timeout: 15000 });
      await expect(dashboardCard).toContainText('责任人:');

      await row.getByRole('button', { name: '关闭' }).click();
      const closeModal = adminPage.locator('.ant-modal-wrap:visible', { hasText: '关闭告警' });
      await expect(closeModal).toBeVisible();
      await closeModal.getByPlaceholder('请描述告警的处理结果（必填）').fill(resolution);
      await closeModal.locator('.ant-modal-footer .ant-btn-primary').click();

      await expect(adminPage.locator('.ant-message-success', { hasText: '告警已关闭' })).toBeVisible({
        timeout: 15000,
      });
      await expect(row).toContainText('已完成');
      await expect(dashboardCard).toContainText('已完成', { timeout: 15000 });
    } finally {
      await adminContext.close();
      await dashboardContext.close();
    }
  });
});
