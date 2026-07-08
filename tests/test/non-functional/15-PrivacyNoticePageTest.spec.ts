import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { PrivacyNoticePage } from '../../pages/Compliance/PrivacyNoticePage';

test.describe('Privacy Notice Page Non-Functional Tests', () => {
    let privacyNoticePage: PrivacyNoticePage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PRIVACY_NOTICE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        privacyNoticePage = await homePage.clickFooterPrivacyNoticeLink();
        await privacyNoticePage.waitForPageToLoad();
    });

    test('Privacy Notice Page', async ({ page }, testInfo) => {
        // Verify accessibility on the Privacy Notice page
        await baseTest.verifyAccessibility(PageName.PRIVACY_NOTICE_PAGE);

        // Verify page context on the Privacy Notice page
        const locators = await privacyNoticePage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});
