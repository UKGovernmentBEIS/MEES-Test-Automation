import { test } from '../../fixtures/authFixtures';
import { PageName } from '../../utils/TestTypes';
import { LandingPage } from '../../pages/LandingPage';
import { PageNotFoundPage } from '../../pages/Compliance/PageNotFoundPage';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Page Not Found Page Non-Functional Tests', () => {

    test('Page Not Found Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PAGE_NOT_FOUND_PAGE);

        // Sign in, then navigate to a non-existent compliance URL to trigger the Page Not Found page
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        await landingPage.clickSignIn_AuthenticatedUser();

        await page.goto((process.env.BASE_URL ?? '') + 'page-does-not-exist');
        const pageNotFoundPage = new PageNotFoundPage(page);
        await pageNotFoundPage.waitForPageToLoad();

        // Verify accessibility on the Page Not Found page
        await baseTest.verifyAccessibility(PageName.PAGE_NOT_FOUND_PAGE);

        // Verify page context on the Page Not Found page
        await baseTest.verifyContextWithLocators(await pageNotFoundPage.getPageContextLocator());
    });
});
