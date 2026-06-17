import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { SupportWhatDoYouWantPage } from '../../pages/Compliance/Support/SupportWhatDoYouWantPage';

test.describe('Support What Do You Want Page Non-Functional Tests', () => {
    let supportWhatDoYouWantPage: SupportWhatDoYouWantPage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.SUPPORT_WHAT_DO_YOU_WANT_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();

        // Navigate to the Support What Do You Want page
        const supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();

        // Select a role to proceed to the Support Contact Form page
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();

        // Populate the Support Contact Form page to proceed to the Support What Do You Want page
        await supportContactFormPage.fillContactFormField('First name', 'Test User');
        await supportContactFormPage.fillContactFormField('Last name', 'User');
        await supportContactFormPage.fillContactFormField('Your email address', 'test.user@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'test.user@example.com');
        supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();
    });

    test('Support What Do You Want Page', async () => {
        // Verify accessibility on the Support What Do You Want page
        await baseTest.verifyAccessibility(PageName.SUPPORT_WHAT_DO_YOU_WANT_PAGE);

        // Verify page context on the Support What Do You Want page
        const locators = await supportWhatDoYouWantPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});