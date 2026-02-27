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

/**
 * Retrieves the email of the currently authenticated user based on the worker index.
 * Determines which authentication state file is actually being used by checking available auth files
 * and mapping to the correct account, rather than assuming parallelIndex directly maps to account index.
 * 
 * @param workerIndex - The worker index to get the email for (defaults to 0 if not provided)
 * @returns The email address of the currently authenticated user
 * @throws Error if no authentication state files are found or if the email cannot be resolved
 */
export function getCurrentUserEmail(workerIndex: number = 0): string {
    const authDir = path.join(__dirname, '../../playwright/auth-states');
    
    // Check if auth directory exists
    if (!fs.existsSync(authDir)) {
        throw new Error(`Authentication states directory not found: ${authDir}`);
    }
    
    // Get all available auth files
    const authFiles = fs.readdirSync(authDir).filter(file => file.startsWith('user-') && file.endsWith('.json'));
    if (authFiles.length === 0) {
        throw new Error('No authentication state files found in the auth-states directory.');
    }
    
    // Sort auth files to ensure consistent ordering
    authFiles.sort();
    
    // Map the worker index to available auth files
    // Since we have limited auth files (usually 2), cycle through them
    const authFileIndex = workerIndex % authFiles.length;
    const selectedAuthFile = authFiles[authFileIndex];
    
    // Extract the actual worker index from the auth file name
    const workerMatch = selectedAuthFile.match(/user-(\d+)\.json/);
    if (!workerMatch) {
        throw new Error(`Invalid auth file format: ${selectedAuthFile}. Expected format: user-N.json`);
    }
    
    const actualWorkerIndex = parseInt(workerMatch[1], 10);
    
    // Map the actual worker index to account configuration
    const accountIndex = actualWorkerIndex % accounts.length;
    
    if (accountIndex >= accounts.length) {
        throw new Error(`No account configured for account index ${accountIndex}. Available accounts: ${accounts.length}`);
    }
    
    const account = accounts[accountIndex];
    
    console.log(`[Auth Utils] Worker ${workerIndex} -> Auth file ${selectedAuthFile} -> Account ${accountIndex} (${account.email})`);
    
    // Resolve the actual email from environment variables
    const { email } = resolveCredentials(account);
    
    return email;
}