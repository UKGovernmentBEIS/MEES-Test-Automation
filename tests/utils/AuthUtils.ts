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
 * Retrieves the email of the currently authenticated user by reading the specific authentication state
 * file that corresponds to the given worker index. This ensures we get the correct user for each worker.
 * 
 * @param workerIndex - The worker index to get the email for (defaults to 0 if not provided)
 * @returns The email address of the currently authenticated user as stored in the application
 * @throws Error if no authentication state files are found or if the email cannot be resolved
 */
export function getCurrentUserEmail(workerIndex: number = 0): string {
    const authDir = path.join(__dirname, '../../playwright/auth-states');
    
    // Check if auth directory exists
    if (!fs.existsSync(authDir)) {
        throw new Error(`Authentication states directory not found: ${authDir}`);
    }
    
    // Look for the specific auth file for this worker
    const expectedAuthFile = `user-${workerIndex}.json`;
    const authFilePath = path.join(authDir, expectedAuthFile);
    
    if (!fs.existsSync(authFilePath)) {
        // Fallback: look for any available auth file if the expected one doesn't exist
        const authFiles = fs.readdirSync(authDir).filter(file => file.startsWith('user-') && file.endsWith('.json'));
        if (authFiles.length === 0) {
            throw new Error('No authentication state files found in the auth-states directory.');
        }
        
        // Use the first available auth file
        const fallbackFile = authFiles[0];
        const fallbackPath = path.join(authDir, fallbackFile);
        console.warn(`[Auth Utils] Expected auth file ${expectedAuthFile} not found, using ${fallbackFile}`);
        
        return extractEmailFromAuthFile(fallbackPath, fallbackFile);
    }
    
    return extractEmailFromAuthFile(authFilePath, expectedAuthFile);
}

/**
 * Helper function to extract email from a specific auth file
 */
function extractEmailFromAuthFile(authFilePath: string, authFileName: string): string {
    try {
        const authState = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));
        
        // Look for Salesforce authentication data in localStorage/origins
        if (authState.origins) {
            for (const origin of authState.origins) {
                if (origin.origin?.includes('salesforce.com') && origin.localStorage) {
                    // Find localStorage entry containing identity information
                    for (const item of origin.localStorage) {
                        try {
                            const data = JSON.parse(item.value);
                            if (data.identity && data.identity.username) {
                                let authenticatedEmail = data.identity.username;
                                
                                // Remove .prsela.co.uk suffix if present to match application's stored format
                                if (authenticatedEmail.endsWith('.prsela.co.uk')) {
                                    authenticatedEmail = authenticatedEmail.replace('.prsela.co.uk', '');
                                }
                                
                                console.log(`[Auth Utils] Found authenticated user: ${authenticatedEmail} from auth file: ${authFileName}`);
                                return authenticatedEmail;
                            }
                        } catch {
                            // Skip invalid JSON entries
                            continue;
                        }
                    }
                }
            }
        }
        
        throw new Error(`Could not find authenticated user email in auth file: ${authFileName}`);
        
    } catch (error) {
        throw new Error(`Failed to read or parse authentication state file ${authFilePath}: ${error}`);
    }
}