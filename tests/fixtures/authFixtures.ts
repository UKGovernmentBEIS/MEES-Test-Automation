import { test as base, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Gets the authentication storage state file path for a specific worker.
 * @param workerIndex - The parallel index of the worker
 * @returns The absolute path to the worker's auth state file
 */
function getAuthStoragePath(workerIndex: number): string {
  return path.join(__dirname, `../../playwright/auth-states/user-${workerIndex}.json`);
}

/**
 * Validates that the authentication state file exists for the worker.
 * @param storageStatePath - The path to the auth state file
 * @param workerIndex - The parallel index of the worker
 * @throws Error if the auth state file is not found
 */
function validateAuthStateExists(storageStatePath: string, workerIndex: number): void {
  if (!fs.existsSync(storageStatePath)) {
    throw new Error(
      `Authentication state file not found at: ${storageStatePath}\n` +
      `Worker ${workerIndex} cannot proceed without authentication state.\n` +
      `Make sure the 'setup' project runs before this test.`
    );
  }
}

/**
 * Creates a browser context with loaded authentication state.
 * @param browser - The browser instance
 * @param storageStatePath - The path to the auth state file
 * @param workerIndex - The parallel index of the worker
 * @returns A browser context with authentication loaded
 */
async function createAuthenticatedContext(
  browser: any,
  storageStatePath: string,
  workerIndex: number
): Promise<BrowserContext> {
  const context = await browser.newContext({
    storageState: storageStatePath
  });
  
  console.log(`[Auth Fixture] Successfully loaded stored authentication state for Worker ${workerIndex} from: ${storageStatePath}`);
  
  return context;
}

/**
 * Custom Playwright test fixture that enables shared browser context across tests.
 * This allows stored authentication state to persist between tests without re-authenticating.
 * 
 * Authentication recovery is now handled by LandingPage.clickSignIn_AuthenticatedUser() 
 * which provides more reliable and accurate authentication recovery at the exact point needed.
 * 
 * How it works:
 * 1. Creates ONE browser context per worker (shared across all tests)
 * 2. Loads authentication state from user.json into this context
 * 3. Each test gets a new page (tab) but reuses the same authenticated context
 * 4. Authentication issues are handled by LandingPage when they actually occur
 * 5. Session cookies and authentication persist throughout all tests
 */
export const test = base.extend<
  { page: Page },              // Test-scoped fixtures (new for each test)
  { workerContext: BrowserContext }  // Worker-scoped fixtures (shared across tests)
>({
  /**
   * Worker-scoped browser context that persists across all tests.
   */
  workerContext: [async ({ browser }, use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const storageStatePath = getAuthStoragePath(workerIndex);
    
    validateAuthStateExists(storageStatePath, workerIndex);
    
    const context = await createAuthenticatedContext(browser, storageStatePath, workerIndex);
    
    // Provide the authenticated context to the tests
    await use(context);
    
    // Clean up: close the context after all tests are done
    // Make this safe in case context is already closed
    try {
      await context.close();
    } catch (error) {
      console.log(`[Auth Fixture] Context already closed for Worker ${workerIndex}: ${error}`);
    }
  }, { scope: 'worker' }],
  
  /**
   * Test-scoped page that validates authentication before each test.
   * Enhanced to handle closed worker contexts by recreating them.
   * Authentication recovery now happens at LandingPage level for better reliability.
   */
  page: async ({ browser, workerContext }, use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const testTitle = testInfo.title;
    let contextToUse = workerContext;
    
    console.log(`[Auth Fixture] Starting test "${testTitle}" on Worker ${workerIndex}`);
    
    // Check if the worker context is still valid (not closed)
    try {
      // Try to create a test page - this will fail if context is closed
      await contextToUse.newPage();
    } catch (error) {
      console.log(`[Auth Fixture] Worker context closed for Worker ${workerIndex}, recreating: ${error}`);
      
      // Context is closed, create a new one from stored auth state
      const storageStatePath = getAuthStoragePath(workerIndex);
      validateAuthStateExists(storageStatePath, workerIndex);
      contextToUse = await createAuthenticatedContext(browser, storageStatePath, workerIndex);
      
      console.log(`[Auth Fixture] Created new context for Worker ${workerIndex}`);
    }
    
    // Create a new page from the working context
    const page = await contextToUse.newPage();
    
    try {
      // Authentication recovery now handled by LandingPage.clickSignIn_AuthenticatedUser()
      // No need for preemptive authentication checking - let the real actions handle it
      console.log(`[Auth Fixture] Page ready for Worker ${workerIndex} - authentication recovery handled by LandingPage`);
      
      // Provide this page to the test
      await use(page);
      
    } finally {
      // Clean up: close only this page (not the context)
      try {
        await page.close();
      } catch (error) {
        console.log(`[Auth Fixture] Page already closed: ${error}`);
      }
      
      // If we created a new context (not the worker context), close it
      if (contextToUse !== workerContext) {
        try {
          await contextToUse.close();
        } catch (error) {
          console.log(`[Auth Fixture] Temporary context already closed: ${error}`);
        }
      }
      
      console.log(`[Auth Fixture] Completed test "${testTitle}" on Worker ${workerIndex}`);
    }
  },
});

// Export expect from Playwright for convenience
export { expect } from '@playwright/test';
