import { expect, test } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/Compliance/HomePage';
import { SupportWhoAreYouPage } from '../../pages/Compliance/Support/SupportWhoAreYouPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Page validation tests', () => {
    let supportWhoAreYouPage: SupportWhoAreYouPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
    });

    test('Verify velidation error messages on the Support Who Are You page when no option is selected', async ({ page }) => {
        await supportWhoAreYouPage.clickContinueButton();
        expect(await supportWhoAreYouPage.getErrorSummary().isVisible()).toBe(true);
        expect(await supportWhoAreYouPage.getErrorSelectOption().isVisible()).toBe(true);
    });

    test('Verify validation error messages on the Support Contact Form page when required fields are left empty', async ({ page }) => {
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        expect(await supportContactFormPage.isDisplayed()).toBe(true);

        await supportContactFormPage.clickContinueButton();
        const errorSummary = supportContactFormPage.getErrorSummary();
        expect(await errorSummary.isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a first name').isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a last name').isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a valid email address').isVisible()).toBe(true);
    });
});

test.describe('Support Process tests', () => {
    let supportWhoAreYouPage: SupportWhoAreYouPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
    });

    const testCases = [
        { role: 'Department for Energy Security and Net Zero official'},
        { role: 'Local authority user'}
    ]

    testCases.forEach(({ role }) => {
        test(`Verify that the Support process works correctly for role: ${role}`, async ({ page }, testInfo) => {
            
            // Select the role and proceed to the Support Contact Form page
            await supportWhoAreYouPage.selectRole(role);
            const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
            await supportContactFormPage.waitForPageToLoad();
            expect(await supportContactFormPage.isDisplayed()).toBe(true);

            // Fill in the contact form fields
            await supportContactFormPage.fillContactFormField('First name', 'John');
            await supportContactFormPage.fillContactFormField('Last name', 'Doe');
            await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
            await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');

            // Click the continue button to proceed to the next page
            const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
            await supportWhatDoYouWantPage.waitForPageToLoad();
            expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);
        });
    });
});

test.describe('Navigation tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    test('Verify that the user can navigate back to the Home page from the Support Who Are You page', async ({ page }, testInfo) => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        const homePageFromSupport = await supportWhoAreYouPage.clickBackToHomePageButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });

    test('Verify that the user can navigate back to the Home page from the Support Contact Form page', async ({ page }, testInfo) => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        const supportWhoAreYouPageFromContactForm = await supportContactFormPage.clickBackToSupportWhoAreYouButton();
        await supportWhoAreYouPageFromContactForm.waitForPageToLoad();
        const homePageFromSupport = await supportWhoAreYouPageFromContactForm.clickBackToHomePageButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });
});