import { test, expect } from '@playwright/test';

const ADMIN = { username: 'admin', password: '123456' };

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/account/login');
  });

  test('login page renders correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('智造远望');
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    await expect(page).not.toHaveURL(/\/account\/login/);
  });

  test('login with invalid password shows error', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 });
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/account/login**', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('智造远望');
  });
});

test.describe('Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5174/account/login');
  });

  test('admin login page renders', async ({ page }) => {
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible({ timeout: 10000 });
  });

  test('admin login with valid credentials', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/\/account\/login/);
  });
});

test.describe('API Integration', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('http://127.0.0.1:8091/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('login API returns token', async ({ request }) => {
    const res = await request.post('http://127.0.0.1:8091/api/auth/login', {
      data: ADMIN,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.token).toBeDefined();
  });
});