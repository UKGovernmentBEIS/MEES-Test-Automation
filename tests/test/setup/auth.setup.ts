import { test as setup } from '@playwright/test';
import { accounts, resolveCredentials, performLogin, saveAuthState, saveWorkerIndexAndUserMapping } from '../../utils/AuthUtils';

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
        saveWorkerIndexAndUserMapping(index, email);
        await saveAuthState(page, index);
    });
});