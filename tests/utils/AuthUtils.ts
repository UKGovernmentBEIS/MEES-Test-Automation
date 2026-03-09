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
 * @param account - Account configuration object with env var names for email, password, accountName
 * @returns Object containing the resolved email, password and accountName strings
 * @throws Error if any required environment variables are undefined
 */
export function resolveCredentials(account: any): { email: string; password: string; accountName: string } {
    const email = process.env[account.email];
    const password = process.env[account.password];
    const accountName = process.env[account.accountName];

    if (!email || !password || !accountName) {
        // Add debugging information to help identify the issue
        const availableTestAccounts = Object.keys(process.env)
            .filter(key => key.includes('TEST_ACCOUNT') || key.includes('EMAIL') || key.includes('PASSWORD') || key.includes('NAME'))
            .map(key => `${key}=${process.env[key] ? '[SET]' : '[UNSET]'}`)
            .join(', ');
            
        console.error(`[Auth Debug] Looking for: ${account.email}, ${account.password}, ${account.accountName}`);
        console.error(`[Auth Debug] Available test-related env vars: ${availableTestAccounts}`);
        console.error(`[Auth Debug] All env var keys containing 'TEST': ${Object.keys(process.env).filter(k => k.includes('TEST')).join(', ')}`);
        
        throw new Error(
            `Required account fields not resolved for ${account.email}, ${account.password}, ${account.accountName}. ` +
            `Environment variables resolve to: email="${email}", password="${password}", accountName="${accountName}". ` +
            `Available test-related env vars: ${availableTestAccounts}`
        );
    }
    
    return { email, password, accountName };
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
 * Creates the worker-to-email mapping file from all configured accounts.
 * This should be called once during setup to establish the mapping for all workers.
 * The mapping file is used to associate each worker with its authenticated user email 
 * for later retrieval during tests.
 * 
 * @param workerIndex - Worker identifier (not used in logic but kept for logging)
 * @param userEmail - The email address of the authenticated user (for logging)
 */
export function saveWorkerIndexAndUserMapping(workerIndex: number, userEmail: string): void {
    const authDir = path.join(__dirname, '../../playwright/auth-states');
    const workerEmailMapFile = path.join(authDir, 'worker-email-map.json');
    
    // Ensure the auth-states directory exists (needed for CI environments)
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    
    // Build the complete worker-to-email mapping from all accounts
    const workerEmailMap: Record<string, string> = {};
    accounts.forEach((account, index) => {
        const { email } = resolveCredentials(account);
        workerEmailMap[index] = email;
    });
    
    // Write the complete worker email mapping file (overwrite each time)
    fs.writeFileSync(workerEmailMapFile, JSON.stringify(workerEmailMap, null, 2));
    
    console.log(`[Auth Utils] Stored email mapping: Worker ${workerIndex} → ${userEmail}`);
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
    
    // Save the authentication state
    await page.context().storageState({ path: authFile });
    
    console.log(`[Auth Utils] Saved authentication state to: ${authFile}`);
}

/**
 * Retrieves the account name of the currently authenticated user.
 * This uses the worker index from the browser context to look up the account info
 * and resolve the accountName from environment variables.
 * 
 * @param page - The Playwright page object to get the context from
 * @returns The account name of the currently authenticated user
 * @throws Error if the worker index is not found in the context or account not found
 */
export function getCurrentUserAccountName(page: Page): string {
    const context = page.context();
    const workerIndex = (context as any)._workerIndex;
    
    if (workerIndex === undefined) {
        throw new Error(
            'No worker index found in browser context. ' +
            'This might indicate an issue with the authentication fixture setup.'
        );
    }
    
    const account = accounts[workerIndex];
    if (!account || !account.accountName) {
        throw new Error(
            `Account not found or missing accountName for worker ${workerIndex}. ` +
            'Please ensure test-accounts.json has accountName fields for all accounts.'
        );
    }
    
    // Resolve accountName from environment variables
    const { accountName } = resolveCredentials(account);
    
    console.log(`[Auth Utils] Retrieved user account name from context: Worker ${workerIndex} → ${accountName}`);
    return accountName;
}

/**
 * Re-authenticates the current user when authentication has been lost.
 * Retrieves worker information from the browser context, performs login with the correct
 * credentials for that worker, and updates the authentication state.
 * 
 * @param page - The Playwright page object with the browser context
 * @throws Error if worker index is not found or no account is available for the worker
 */
export async function reAuthenticate(page: Page): Promise<void> {
    console.log(`[Auth Utils] Authentication lost - performing re-authentication...`);
    
    // Get worker index from the browser context (stored by auth fixtures)
    const workerIndex = (page.context() as any)._workerIndex;
    if (workerIndex === undefined) {
        throw new Error(
            'Worker index not found in browser context. This indicates an issue with the ' +
            'authentication fixture setup - the context should have been initialized with worker information.'
        );
    }
    
    console.log(`[Auth Utils] Re-authenticating using Worker ${workerIndex} credentials...`);
    // Get the account for this worker
    const account = accounts[workerIndex];
    if (!account) {
        throw new Error(`No account available for worker ${workerIndex}`);
    }
    // Resolve credentials and perform login
    const { email, password } = resolveCredentials(account);
    await performLogin(page, email, password);
    // Save the new authentication state so subsequent tests can use it
    console.log(`[Auth Utils] Saving refreshed authentication state for Worker ${workerIndex}...`);
    await saveAuthState(page, workerIndex);
    console.log(`[Auth Utils] Re-authentication completed successfully`);
}