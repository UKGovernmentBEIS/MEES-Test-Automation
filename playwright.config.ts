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
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['github']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    { 
      name: 'setup', 
      testMatch: /.*\/test\/setup\/.*\.setup\.ts/,
      fullyParallel: true,
      workers: 2
    },

    // Functional tests - user journeys, data validation, etc.
    {
      name: 'functional',
      testDir: './tests/test/functional',
      use: { 
        ...devices['Desktop Chrome'],
        // Note: storageState is loaded dynamically in authFixtures based on worker index
      },
      dependencies: ['setup']
    },

    // Non-functional tests - accessibility, performance, etc.
    {
      name: 'accessibility',
      testDir: './tests/test/non-functional/accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Note: storageState is loaded dynamically in authFixtures based on worker index
      },
      dependencies: ['setup']
    },

    // Default chromium project for backward compatibility
    {
      name: 'chromium',
      testDir: './tests/test',
      use: { 
        ...devices['Desktop Chrome'],
        // Note: storageState is loaded dynamically in authFixtures based on worker index
      },
      dependencies: ['setup']
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
