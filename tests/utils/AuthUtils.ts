import path from 'path';
import fs from 'fs';
import { Page } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';

// Load test accounts configuration
const accountsPath = path.join(__dirname, '../config/test-accounts.json');
export const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

/**
 * Resolves actual credentials from environment variables using the account configuration.
 * 
 * @param account - Account configuration object with env var names for email and password
 * @returns Object containing the resolved email and password strings
 * @throws Error if either email or password environment variables are undefined
 */
export function resolveCredentials(account: any): { email: string; password: string } {
    const email = process.env[account.email];
    const password = process.env[account.password];
    
    if (!email || !password) {
        // Add debugging information to help identify the issue
        const availableTestAccounts = Object.keys(process.env)
            .filter(key => key.includes('TEST_ACCOUNT') || key.includes('EMAIL') || key.includes('PASSWORD'))
            .map(key => `${key}=${process.env[key] ? '[SET]' : '[UNSET]'}`)
            .join(', ');
            
        console.error(`[Auth Debug] Looking for: ${account.email}, ${account.password}`);
        console.error(`[Auth Debug] Available test-related env vars: ${availableTestAccounts}`);
        console.error(`[Auth Debug] All env var keys containing 'TEST': ${Object.keys(process.env).filter(k => k.includes('TEST')).join(', ')}`);
        
        throw new Error(
            `Email or password not resolved for ${account.email} and/or ${account.password}. ` +
            `Environment variable for "${account.email}" resolves to "${email}". ` +
            `Environment variable for "${account.password}" resolves to "${password}". ` +
            `Available test-related env vars: ${availableTestAccounts}`
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
export async function performLogin(page: Page, email: string, password: string): Promise<void> {
    const landingPage = new LandingPage(page);
    await landingPage.navigate();

    const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
    const loginEmailPage = await signInOrCreatePage.clickSignIn();

    const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
    const homePage = await loginPasswordPage.enterPasswordAndContinueToComplianceLandingPage(password);
    await homePage.waitForPageToLoad();
}

/**
 * Saves the authenticated browser context state to a JSON file.
 * This storage state includes cookies, localStorage, and sessionStorage.
 * Each worker gets a unique auth file to maintain isolated sessions during parallel execution.
 * 
 * @param page - Playwright page object with authenticated session
 * @param workerIndex - Worker identifier used to create unique auth file names
 */
export async function saveAuthState(page: Page, workerIndex: number): Promise<void> {
    const authDir = path.join(__dirname, '../../playwright/auth-states');
    const authFile = path.join(authDir, `user-${workerIndex}.json`);
    
    // Ensure the auth-states directory exists (needed for CI environments)
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    
    await page.context().storageState({ path: authFile });
    console.log(`[Auth Utils] Saved authentication state to: ${authFile}`);
}