import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { SupportContactFormPage } from '../../pages/Compliance/Support/SupportContactFormPage';

test.describe('Support Contact Form Page Non-Functional Tests', () => {
    let supportContactFormPage: SupportContactFormPage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.SUPPORT_CONTACT_FORM_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
    });

    test('Support Contact Form Page', async () => {
        // Verify accessibility on the Support Contact Form page
        await baseTest.verifyAccessibility(PageName.SUPPORT_CONTACT_FORM_PAGE);

        // Verify page context on the Support Contact Form page
        const locators = await supportContactFormPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});