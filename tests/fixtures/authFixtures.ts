import { test as base, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Custom Playwright test fixture that enables shared browser context across tests.
 * This allows stored authentication state to persist between tests without re-authenticating.
 * How it works:
 * 1. Creates ONE browser context per worker (shared across all tests)
 * 2. Loads authentication state from user.json into this context
 * 3. Each test gets a new page (tab) but reuses the same authenticated context
 * 4. Session cookies and authentication persist throughout all tests
 * 
 * Analogy: Like keeping a browser window open (context) while opening/closing tabs (pages)
 */
export const test = base.extend<
  { page: Page },              // Test-scoped fixtures (new for each test)
  { workerContext: BrowserContext }  // Worker-scoped fixtures (shared across tests)
>({
  /**
   * Worker-scoped browser context that persists across all tests.
   * 
   * This context:
   * - Is created ONCE when the worker starts
   * - Loads authentication state from worker-specific file (user-0.json, user-1.json, etc.)
   * - Each worker uses a different test account
   * - Stays open for all tests in this worker
   * - Preserves cookies, localStorage, and session data
   * - Closes only when all tests complete
   */
  workerContext: [async ({ browser }, use, testInfo) => {
    // Get worker-specific auth file based on parallel index
    const workerIndex = testInfo.parallelIndex;
    const storageStatePath = path.join(__dirname, `../../playwright/.auth/user-${workerIndex}.json`);
    
    // Create a new browser context with loaded authentication state
    // This loads the saved cookies and storage from the worker-specific file
    const context = await browser.newContext({
      storageState: fs.existsSync(storageStatePath) ? storageStatePath : undefined
    });
    
    console.log(`Worker ${workerIndex} using auth file: user-${workerIndex}.json`);
    
    // Provide this context to all tests in this worker
    await use(context);
    
    // Clean up: close the context only after all tests finish
    await context.close();
  }, { scope: 'worker' }],  // 'worker' scope = shared across all tests
  
  /**
   * Test-scoped page that gets a fresh page from the shared context.
   * 
   * Each test:
   * - Gets a NEW page (like opening a new browser tab)
   * - But uses the SAME authenticated context (stays logged in)
   * - Page is closed after test, but context remains open
   */
  page: async ({ workerContext }, use) => {
    // Create a new page from the shared authenticated context
    const page = await workerContext.newPage();
    
    // Provide this page to the test
    await use(page);
    
    // Clean up: close only this page (not the context)
    await page.close();
  },
});

// Export expect from Playwright for convenience
export { expect } from '@playwright/test';
