import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Sandboxes with a system Chromium and no playwright-managed download
        // (bohosluzby/metro pattern): PW_CHROMIUM=/path/to/chromium npx playwright test
        ...(process.env.PW_CHROMIUM
          ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } }
          : {}),
      },
    },
  ],
  webServer: {
    // CI builds dist once with the VITE_SUPABASE_* secrets and deploys it; rebuilding here would
    // overwrite it with an unconfigured build. So CI previews the existing dist (what ships).
    command: `${process.env.CI ? '' : 'npm run build && '}npm run preview -- --port 4173`,
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
