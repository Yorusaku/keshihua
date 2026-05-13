import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    { command: 'pnpm --filter @smart/server dev', port: 8091, reuseExistingServer: true, timeout: 15000 },
    { command: 'pnpm --filter smart-dashboard dev', port: 5173, reuseExistingServer: true, timeout: 15000 },
  ],
});