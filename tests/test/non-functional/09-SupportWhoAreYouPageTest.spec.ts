import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { SupportWhoAreYouPage } from '../../pages/Compliance/Support/SupportWhoAreYouPage';

test.describe('Support Who Are You Page Non-Functional Tests', () => {
    let supportWhoAreYouPage: SupportWhoAreYouPage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.SUPPORT_WHO_ARE_YOU_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
    });

    test('Support Who Are You Page', async ({ page }, testInfo) => {
        // Verify accessibility on the Support Who Are You page
        await baseTest.verifyAccessibility(PageName.SUPPORT_WHO_ARE_YOU_PAGE);

        // Verify page context on the Support Who Are You page
        const locators = await supportWhoAreYouPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});