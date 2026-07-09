import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { AccessibilityStatementPage } from '../../pages/Compliance/AccessibilityStatementPage';

test.describe('Accessibility Statement Page Non-Functional Tests', () => {
    let accessibilityStatementPage: AccessibilityStatementPage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ACCESSIBILITY_STATEMENT_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        accessibilityStatementPage = await homePage.clickFooterAccessibilityStatementLink();
        await accessibilityStatementPage.waitForPageToLoad();
    });

    test('Accessibility Statement Page', async ({ page }, testInfo) => {
        // Verify accessibility on the Accessibility Statement page
        await baseTest.verifyAccessibility(PageName.ACCESSIBILITY_STATEMENT_PAGE);

        // Verify page context on the Accessibility Statement page
        const locators = await accessibilityStatementPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});
