import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the seller-portal E2E suite.
 *
 * Runs against the real API + web dev servers (which in turn require the local
 * Docker infra — Postgres + MinIO — to be up and the DB seeded). Locally the
 * servers are auto-started and reused if already running; in CI they are
 * started fresh.
 *
 * Authentication is performed fresh per test via a fixture (see
 * `tests/fixtures.ts`). This is intentional: the API issues single-use rotating
 * refresh tokens, so a shared/saved session cannot be reused across tests.
 */
const WEB_URL = 'http://localhost:5173';
const API_HEALTH = 'http://localhost:4000/health';
const repoRoot = path.join(import.meta.dirname, '..');

export default defineConfig({
  testDir: './tests',
  // Hard-purges only `e2e-` prefixed rows after the run (see the file).
  globalTeardown: './tests/global-teardown.ts',
  // Serial + single worker: the suite shares one dev database, so determinism
  // matters more than raw speed here.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: 'pnpm --filter @arts/api dev',
      url: API_HEALTH,
      cwd: repoRoot,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter @arts/seller-web dev',
      url: WEB_URL,
      cwd: repoRoot,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
