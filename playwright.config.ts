import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // Timeout for each test
  timeout: 30000, // 30 seconds

  // Test retries
  retries: 2,

  // Global timeout for all tests
  globalTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
};

export default config;
