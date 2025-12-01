import { test as setup, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authentication setup', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
    const loginEmailPage = await signInOrCreatePage.clickSignIn();

    const loginPasswordPage = await loginEmailPage.enterEmailAndContinue('michal.swierkosz@triad.co.uk');
    const haveRegisteredExempPage = await loginPasswordPage.enterPasswordAndContinue('M33SPassword!');
    await haveRegisteredExempPage.waitForPageToLoad();

    await page.context().storageState({ path: authFile });
});