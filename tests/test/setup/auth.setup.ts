import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { accounts, resolveCredentials, performLogin } from '../../utils/AuthUtils';

/**
 * Playwright setup function that authenticates test users and saves their session state.
 * This runs before tests to create authenticated browser contexts for parallel test execution.
 * Each worker gets assigned a unique test account based on its parallel index.
 * 
 * For more information on how stored authentication state works, see the 
 * 'Stored Authentication State' section in the project README.
 * 
 * @param page - Playwright page object for browser interaction
 * @param testInfo - Test metadata including parallelIndex for worker identification
 */

// Create a separate test for each account to ensure parallel execution creates all auth files
accounts.forEach((account, index) => {
    setup(`authentication setup - user ${index}`, async ({ page }, testInfo) => {
        const { email, password } = resolveCredentials(account);
        
        await performLogin(page, email, password);
        await saveAuthState(page, index);
    });
});

/**
 * Saves the authenticated browser context state to a JSON file.
 * This storage state includes cookies, localStorage, and sessionStorage.
 * Each worker gets a unique auth file to maintain isolated sessions during parallel execution.
 * 
 * @param page - Playwright page object with authenticated session
 * @param workerIndex - Worker identifier used to create unique auth file names
 */
async function saveAuthState(page: any, workerIndex: number) {
    const authDir = path.join(__dirname, '../../../playwright/auth-states');
    const authFile = path.join(authDir, `user-${workerIndex}.json`);
    
    // Ensure the auth-states directory exists (needed for CI environments)
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    
    await page.context().storageState({ path: authFile });
    console.log(`[Auth Setup] Saved authentication state to: ${authFile}`);
}