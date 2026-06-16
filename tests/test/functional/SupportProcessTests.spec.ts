import { expect, test } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/Compliance/HomePage';
import { SupportWhoAreYouPage } from '../../pages/Compliance/Support/SupportWhoAreYouPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Page validation tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    test('Verify velidation error messages on the Support Who Are You page when no option is selected', async ({ page }) => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.clickContinueButton();
        expect(await supportWhoAreYouPage.getErrorSummary().isVisible()).toBe(true);
        expect(await supportWhoAreYouPage.getErrorSelectOption().isVisible()).toBe(true);
    });
});

test.describe('Support Process tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
    });

    const testCases = [
        { role: 'Department for Energy Security and Net Zero official'},
        { role: 'Local authority user'}
    ]

    testCases.forEach(({ role }) => {
        test(`Verify that the Support process works correctly for role: ${role}`, async ({ page }, testInfo) => {
            const landingPage = new LandingPage(page);
            await landingPage.navigate();
            homePage = await landingPage.clickSignIn_AuthenticatedUser();
            const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
            await supportWhoAreYouPage.waitForPageToLoad();
            const supportContactFormPage = await supportWhoAreYouPage.selectRole(role);
            await supportContactFormPage.waitForPageToLoad();
            expect(await supportContactFormPage.isDisplayed()).toBe(true);
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
});