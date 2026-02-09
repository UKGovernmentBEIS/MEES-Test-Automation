import { test, expect } from '@playwright/test';
import { TestAnnotations, PageName, TestType } from '../../utils/TestTypes.ts';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import fs from 'fs';
import path from 'path';

test.describe('No Access Page Non-Functional Tests', () => {
    let landingPage: LandingPage;
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY),
            TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
        );

        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('No Access Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.NO_ACCESS_PAGE));

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

        // Verify accessibility on the One Login enter password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter password page
        await expect(noAccessPage.pageContext).toMatchAriaSnapshot();
    });
});