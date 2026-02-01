import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

// Load environment variables from .env file
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel. Set it to true when multiple test-accounts are used */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Set workers to match the number of fully configured test accounts.
     Each worker needs a separate GOV.UK One Login account with completed MFA setup.*/
  workers: 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters
     Using custom reporter to enhance non-functional test reports */
  reporter: [['html'], ['github'], ['./tests/utils/NonFunctionalTestReporter.ts']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Capture screenshots for all tests (pass and fail) for debugging */
    screenshot: 'on',
  },

  /* Configure projects */
  projects: [
    { 
      name: 'setup', 
      testMatch: /.*\/test\/setup\/.*\.setup\.ts/,
      fullyParallel: true
    },
    {
      name: 'functional',
      testDir: './tests/test/functional',
      // Set RUN_SETUP_AUTOMATICALLY=1 to run setup before tests (convenient for local dev)
      dependencies: process.env.RUN_SETUP_AUTOMATICALLY ? ['setup'] : []
    },

    // Non-functional tests - accessibility, context verification, performance, etc.
    {
      name: 'non-functional',
      testDir: './tests/test/non-functional',
      // Set RUN_SETUP_AUTOMATICALLY=1 to run setup before tests (convenient for local dev)
      dependencies: process.env.RUN_SETUP_AUTOMATICALLY ? ['setup'] : []
    },

    // API tests - page-api (user auth) and dms-api (service auth)
    {
      name: 'api',
      testDir: './tests/test/api',
      fullyParallel: true
    },
  ]
});
