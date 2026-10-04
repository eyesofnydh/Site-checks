const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', timeout: 60000, expect: { timeout: 10000 },
  fullyParallel: false, workers: 1, retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'results.json' }]],
  use: { baseURL: process.env.BASE_URL || 'https://nidhin-narayanan.netlify.app',
    navigationTimeout: 45000, trace: 'retain-on-failure', screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...(process.env.USE_CHROME === '1' ? { channel: 'chrome' } : {}) },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
  ]
});
