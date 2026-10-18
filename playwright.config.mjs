import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure'},
  projects: [
    {name: 'Desktop Chrome', use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 800}}},
    {name: 'iPad Safari', use: {...devices['iPad Pro 11'], browserName: 'webkit'}},
    {name: 'iPhone Safari', use: {...devices['iPhone 13'], browserName: 'webkit'}}
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
