import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // Where Playwright looks for test files
  testDir: './tests',
  timeout: 30_000,
  globalTimeout: 10 * 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests once in CI, never locally
  retries: process.env.CI ? 1 : 0,

  // Parallel workers — safe for API tests; you may want 1 for UI tests
  workers: process.env.CI ? 2 : undefined,

  // Shared reporter — use the list reporter locally, HTML in CI
  reporter: [['html'], ['list']],

  // ─── GLOBAL SETTINGS shared by all projects ────────────────────────────────
  use: {
    /**
     * IMPORTANT: tells Playwright that `data-test` is the attribute to resolve
     * when you call `page.getByTestId('...')`.
     *
     * The site uses data-test="email", data-test="login-submit", etc.
     * Without this, getByTestId would look for data-testid (the default).
     */
    testIdAttribute: 'data-test',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    // Capture a screenshot only on test failure (keeps storage low)
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    // ── Setup ──────────────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        baseURL: process.env.UI_BASE_URL,
      },
    },

    // ── API: public (no setup dependency) ─────────────────────────
    // Tests live in tests/api/**/*.spec.ts
    // The `request` fixture will use this baseURL automatically.
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'api-public',
      testMatch: /tests\/api\/public\/.+\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL,

        // Always send & accept JSON unless a test overrides it
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // ── API: authenticated (depends on setup) ─────────────────────
    {
      name: 'api-authenticated',
      testMatch: /tests\/api\/authenticated\/.+\.spec\.ts/,
      dependencies: ['setup'], // ← setup must finish first
      use: {
        baseURL: process.env.API_BASE_URL,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // ── UI: public (no setup dependency) ──────────────────────────
    {
      name: 'ui-public',
      testMatch: /tests\/ui\/public\/.+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL,
        permissions: ['clipboard-read'],
      },
    },

    // ── UI: authenticated (depends on setup, uses saved session) ──
    {
      name: 'ui-authenticated',
      testMatch: /tests\/ui\/authenticated\/.+\.spec\.ts/,
      dependencies: ['setup'], // ← setup must finish first
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL,
        storageState: '.auth/storage.json', // ← pre-loaded session
        permissions: ['clipboard-read'],
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
