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
 * Loads the user email mapping from the stored worker email map file
 * @param workerIndex - The parallel index of the worker
 * @returns The email address of the authenticated user for this worker
 */
function getStoredUserEmail(workerIndex: number): string {
  const authDir = path.join(__dirname, '../../playwright/auth-states');
  const workerEmailMapFile = path.join(authDir, 'worker-email-map.json');
  
  if (!fs.existsSync(workerEmailMapFile)) {
    throw new Error(
      `Worker email map file not found at: ${workerEmailMapFile}\n` +
      `Make sure the 'setup' project runs before this test to create the email mapping.`
    );
  }
  
  try {
    const workerEmailMap = JSON.parse(fs.readFileSync(workerEmailMapFile, 'utf-8'));
    const userEmail = workerEmailMap[workerIndex];
    
    if (!userEmail) {
      throw new Error(
        `No email mapping found for Worker ${workerIndex} in email map file.\n` +
        `Available workers: ${Object.keys(workerEmailMap).join(', ')}`
      );
    }
    
    return userEmail;
  } catch (error) {
    throw new Error(`Failed to read worker email map file ${workerEmailMapFile}: ${error}`);
  }
}

/**
 * Creates a browser context with loaded authentication state and user email mapping.
 * This function performs multiple setup tasks:
 * 1. Creates a new browser context with the provided authentication state
 * 2. Loads the user email mapping from the worker email map file
 * 3. Stores both the authenticated user email and worker index in the context for later retrieval
 * 
 * This ensures that each worker has a properly configured context with both
 * authentication credentials and user identity information available to tests.
 * 
 * @param browser - The browser instance
 * @param storageStatePath - The path to the auth state file
 * @param workerIndex - The parallel index of the worker
 * @returns A browser context with authentication loaded and user email mapping stored
 */
async function createBrowserContext(
  browser: any,
  storageStatePath: string,
  workerIndex: number
): Promise<BrowserContext> {

  // Create a new browser context with the loaded authentication state
  const context = await browser.newContext({
    storageState: storageStatePath
  });
  
  // Store the email mapping in the context for later retrieval
  // Get the stored email mapping
  const userEmail = getStoredUserEmail(workerIndex);
  // Store the email and worker index in the context for later retrieval
  (context as any)._authenticatedUserEmail = userEmail;
  (context as any)._workerIndex = workerIndex;
  
  console.log(`[Auth Fixture] Successfully loaded stored authentication state for Worker ${workerIndex} from: ${storageStatePath}`);
  console.log(`[Auth Fixture] Stored user email mapping: Worker ${workerIndex} → ${userEmail}`);
  
  return context;
}

/**
 * Custom Playwright test fixture that enables shared browser context across tests.
 * This allows stored authentication state to persist between tests without re-authenticating.
 * 
 * Authentication recovery is handled by LandingPage.clickSignIn_AuthenticatedUser() 
 * when actually needed during test execution, eliminating the need for preemptive validation.
 * 
 * How it works:
 * 1. Creates ONE browser context per worker (shared across all tests)  
 * 2. Loads authentication state and user email mapping into this context
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
    
    const context = await createBrowserContext(browser, storageStatePath, workerIndex);
    
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
   * Test-scoped page fixture that creates a new page for each test.
   * Authentication recovery is handled by LandingPage when actually needed during test execution.
   */
  page: async ({ workerContext }, use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const testTitle = testInfo.title;
    
    console.log(`[Auth Fixture] Starting test "${testTitle}" on Worker ${workerIndex}`);
    
    // Create a new page from the worker context
    const page = await workerContext.newPage();
    
    try {
      // Authentication recovery handled by LandingPage when needed
      console.log(`[Auth Fixture] Page ready for Worker ${workerIndex} - authentication recovery handled by LandingPage`);
      
      // Provide this page to the test
      await use(page);
      
    } finally {
      // Clean up: close the page
      try {
        await page.close();
      } catch (error) {
        console.log(`[Auth Fixture] Page already closed: ${error}`);
      }
      
      console.log(`[Auth Fixture] Completed test "${testTitle}" on Worker ${workerIndex}`);
    }
  },
});

// Export expect from Playwright for convenience
export { expect } from '@playwright/test';
