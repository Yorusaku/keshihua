import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'pnpm --filter @smart/server dev',
      port: 8091,
      reuseExistingServer: true,
      timeout: 15000,
      env: {
        JWT_SECRET: 'smart-manufacturing-e2e-secret',
        PG_HOST: '127.0.0.1',
        PG_PORT: process.env.PG_PORT ?? '5434',
        PG_USER: 'postgres',
        PG_PASSWORD: 'smart123',
        PG_DATABASE: 'smart_manufacturing',
      },
    },
    {
      command: 'pnpm --filter smart-dashboard dev',
      port: 5173,
      reuseExistingServer: true,
      timeout: 15000,
      env: { VITE_API_MODE: 'api' },
    },
    {
      command: 'pnpm --filter @smart/admin dev',
      port: 5174,
      reuseExistingServer: true,
      timeout: 15000,
      env: { VITE_API_MODE: 'api' },
    },
  ],
});
