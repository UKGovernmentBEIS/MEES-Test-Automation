import { test as setup } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import path from 'path';
import fs from 'fs';

// Load test accounts configuration
const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

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
 * Resolves actual credentials from environment variables using the account configuration.
 * 
 * @param account - Account configuration object with env var names for email and password
 * @returns Object containing the resolved email and password strings
 * @throws Error if either email or password environment variables are undefined
 */
function resolveCredentials(account: any): { email: string; password: string } {
    const email = process.env[account.email];
    const password = process.env[account.password];
    
    if (!email || !password) {
        throw new Error(
            `Email or password not resolved for ${account.email} and/or ${account.password}. ` +
            `Environment variable for "${account.email}" resolves to "${email}". ` +
            `Environment variable for "${account.password}" resolves to "${password}". `
        );
    }
    
    return { email, password };
}

/**
 * Executes the complete login flow through the application's authentication pages.
 * 
 * @param page - Playwright page object for browser automation
 * @param email - User's email address for authentication
 * @param password - User's password for authentication
 */
async function performLogin(page: any, email: string, password: string) {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
    const loginEmailPage = await signInOrCreatePage.clickSignIn();

    const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
    const haveRegisteredExempPage = await loginPasswordPage.enterPasswordAndContinue(password);
    await haveRegisteredExempPage.waitForPageToLoad();
}

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