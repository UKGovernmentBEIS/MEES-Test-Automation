import { test as setup } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import path from 'path';
import fs from 'fs';

// Load test accounts configuration
const accountsPath = path.join(__dirname, '../config/test-accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

setup('authentication setup', async ({ page }, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const account = selectAccount(workerIndex);
    const { email, password } = resolveCredentials(account);
    
    await performLogin(page, email, password);
    await saveAuthState(page, workerIndex);
});

function selectAccount(workerIndex: number) {
    return accounts[workerIndex % accounts.length];
}

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

async function performLogin(page: any, email: string, password: string) {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
    const loginEmailPage = await signInOrCreatePage.clickSignIn();

    const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
    const haveRegisteredExempPage = await loginPasswordPage.enterPasswordAndContinue(password);
    await haveRegisteredExempPage.waitForPageToLoad();
}

async function saveAuthState(page: any, workerIndex: number) {
    const authFile = path.join(__dirname, `../../playwright/.auth/user-${workerIndex}.json`);
    await page.context().storageState({ path: authFile });
}