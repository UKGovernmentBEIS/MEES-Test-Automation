import { test, expect } from '@playwright/test';
import { TestAnnotations, PageName, TestType } from '../../utils/TestTypes.ts';
import { HomePage } from '../../pages/HomePage.ts';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test.describe('No Access Page Non-Functional Tests', () => {
    let homePage: HomePage;
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY),
            TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
        );

        homePage = new HomePage(page);
        await homePage.navigate();
    });

    test('No Access Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.NO_ACCESS_PAGE));

        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue('michal.swierkosz@triad.co.uk');
        const noAccessPage = await loginPasswordPage.enterPasswordAndContinueToNoAccessPage('M33SPassword!');

        // Verify accessibility on the One Login enter password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter password page
        await expect(noAccessPage.pageContext).toMatchAriaSnapshot();
    });
});