import { test as setup, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import path from 'path';
import fs from 'fs';

// Load test accounts configuration
const accountsPath = path.join(__dirname, '../config/test-accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

setup('authentication setup', async ({ page }, testInfo) => {
    // Use worker index to select different account per worker
    const workerIndex = testInfo.parallelIndex;
    const account = accounts[workerIndex % accounts.length];
    
    // Resolve password from environment variable
    const password = process.env[account.password];
    
    // Validate password was resolved
    if (!password) {
        throw new Error(
            `Password not resolved for ${account.email}. ` +
            `Environment variable "${account.password}" is not set. ` +
            `Make sure it exists in .env file (locally) or GitHub Secrets (CI).`
        );
    }
    
    // Save to worker-specific auth file
    const authFile = path.join(__dirname, `../../playwright/.auth/user-${workerIndex}.json`);

    const homePage = new HomePage(page);
    await homePage.navigate();

    const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
    const loginEmailPage = await signInOrCreatePage.clickSignIn();

    const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(account.email);
    const haveRegisteredExempPage = await loginPasswordPage.enterPasswordAndContinue(password);
    await haveRegisteredExempPage.waitForPageToLoad();

    // Save storage state (cookies, localStorage, IndexedDB)
    await page.context().storageState({ path: authFile });
    
    console.log(`Worker ${workerIndex} authenticated as: ${account.email}`);
});