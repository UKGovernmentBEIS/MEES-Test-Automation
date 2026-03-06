import { test } from '@playwright/test';
import { PageName } from '../../utils/TestTypes';
import { LandingPage } from '../../pages/LandingPage';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import fs from 'fs';
import path from 'path';

test.describe('No Access Page Non-Functional Tests', () => {
    let landingPage: LandingPage;
    test.beforeEach(async ({ page }) => {
        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('No Access Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.NO_ACCESS_PAGE);

        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8'));
        
        // Resolve environment variables for the no-access account credentials
        const email = process.env[accountsConfig.noAccessAccount.email];
        const password = process.env[accountsConfig.noAccessAccount.password];
        
        if (!email || !password) {
            throw new Error(
                `No access account credentials not resolved. ` +
                `Email: ${email}, Password: ${password ? '[SET]' : '[NOT SET]'}`
            );
        }

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        const noAccessPage = await loginPasswordPage.enterPasswordAndContinueToNoAccessPage(password);

        // Verify accessibility on the No Access page
        await baseTest.verifyAccessibility(PageName.NO_ACCESS_PAGE);

        // Verify page context on the No Access page
        await baseTest.verifyContextWithLocators([noAccessPage.pageContext]);
    });
});