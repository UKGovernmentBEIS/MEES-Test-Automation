import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { SupportDetailsPage } from '../../pages/Compliance/Support/SupportDetailsPage';

test.describe('Support Details Page Non-Functional Tests', () => {
    let supportDetailsPage: SupportDetailsPage;
    let baseTest: BaseNonFunctionalTest;

    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.SUPPORT_DETAILS_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();

        // Navigate to the Support Details page
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
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();

        // Select an option to proceed to the Support Details page
        await supportWhatDoYouWantPage.selectHelpRequestOption('I have a question about the policy or guidance');
        supportDetailsPage = await supportWhatDoYouWantPage.clickContinueButton();
        await supportDetailsPage.waitForPageToLoad();
    });

    test('Support Details Page', async () => {
        // Verify accessibility on the Support Details page
        await baseTest.verifyAccessibility(PageName.SUPPORT_DETAILS_PAGE);

        // Verify page context on the Support Details page
        const locators = await supportDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});