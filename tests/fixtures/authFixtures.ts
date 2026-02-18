import { test as base, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomePage } from '../pages/Compliance/HomePage';
import { accounts, resolveCredentials, performLogin } from '../utils/AuthUtils';

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
 * Checks if the current session is authenticated by trying to access a protected page.
 * @param page - Playwright page object
 * @returns true if authenticated, false if redirected to login
 */
async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Navigate to the protected compliance home page
    await page.goto('/compliance/landing-page');
    
    // Use HomePage's waitForPageToLoad method for proper page loading
    const homePage = new HomePage(page);
    await homePage.waitForPageToLoad();
    
    // Check if we're on the compliance landing page
    const currentUrl = page.url();
    const isAuthenticated = currentUrl.includes('compliance/landing-page');
    
    if (isAuthenticated) {
      console.log(`[Auth Check] Authentication confirmed - on compliance landing page: ${currentUrl}`);
      return true;
    } else {
      console.log(`[Auth Check] Authentication lost - not on compliance landing page: ${currentUrl}`);
      return false;
    }
    
  } catch (error) {
    console.log(`[Auth Check] Error checking authentication: ${error}`);
    return false;
  }
}

/**
 * Re-authenticates the user by performing the complete login flow.
 * Uses the same functions as auth.setup.ts to ensure identical behavior.
 * @param page - Playwright page object
 * @param workerIndex - The parallel index of the worker
 */
async function reAuthenticate(page: Page, workerIndex: number): Promise<void> {
  try {
    console.log(`[Auth Recovery] Starting re-authentication for Worker ${workerIndex}`);
    
    // Get the account for this worker (same logic as auth.setup.ts)
    const account = accounts[workerIndex];
    
    if (!account) {
      throw new Error(`No account available for worker ${workerIndex}`);
    }
    
    // Use the same credential resolution as auth.setup.ts
    const { email, password } = resolveCredentials(account);
    
    // Clear any existing state and perform fresh login
    await page.context().clearCookies();
    
    // Use the exact same login flow as auth.setup.ts
    await performLogin(page, email, password);
    
    console.log(`[Auth Recovery] Re-authentication successful for Worker ${workerIndex}`);
    
  } catch (error) {
    console.error(`[Auth Recovery] Failed to re-authenticate Worker ${workerIndex}: ${error}`);
    throw error;
  }
}

/**
 * Validates authentication state and recovers if needed.
 * @param page - Playwright page object 
 * @param workerIndex - The parallel index of the worker
 */
async function ensureAuthenticated(page: Page, workerIndex: number): Promise<void> {
  const isAuth = await isAuthenticated(page);
  
  if (!isAuth) {
    console.log(`[Auth Fixture] Authentication lost for Worker ${workerIndex}, attempting recovery...`);
    await reAuthenticate(page, workerIndex);
    
    // Verify recovery was successful
    const isAuthAfterRecovery = await isAuthenticated(page);
    if (!isAuthAfterRecovery) {
      throw new Error(`Authentication recovery failed for Worker ${workerIndex}`);
    }
    
    console.log(`[Auth Fixture] Authentication successfully recovered for Worker ${workerIndex}`);
  }
}

/**
 * Custom Playwright test fixture that enables shared browser context across tests.
 * This allows stored authentication state to persist between tests without re-authenticating.
 * 
 * Enhanced with authentication validation and recovery to handle retry mechanism issues:
 * - Checks authentication status before each test
 * - Automatically recovers from lost authentication
 * - Handles test failures that invalidate sessions
 * 
 * How it works:
 * 1. Creates ONE browser context per worker (shared across all tests)
 * 2. Loads authentication state from user.json into this context
 * 3. Each test gets a new page (tab) but reuses the same authenticated context
 * 4. Validates authentication before each test and recovers if needed
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
   * This prevents retry failures caused by invalidated authentication sessions.
   * Enhanced to handle closed worker contexts by recreating them.
   */
  page: async ({ browser, workerContext }, use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    let contextToUse = workerContext;
    
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
      // Validate and ensure authentication before each test
      // This is crucial for handling retries and test failures
      await ensureAuthenticated(page, workerIndex);
      
      // Provide this authenticated page to the test
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
    }
  },
});

// Export expect from Playwright for convenience
export { expect } from '@playwright/test';
