import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { CookiesSettingsPage } from '../../pages/Compliance/Cookies/CookiesSettingsPage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Cookies Settings Page - Service Title Link - Unauthenticated', () => {
    let cookiesSettingsPage: CookiesSettingsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        // Navigate to Landing page and sign in as an authenticated user
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        await homePage.waitForPageToLoad();

        // Explicitly Sign Out to ensure the user is unauthenticated before navigating to the Cookies Settings page)
        const newLandingPage = await homePage.clickSignOutButton();
        await newLandingPage.waitForPageToLoad();
        cookiesSettingsPage = await newLandingPage.clickViewCookies();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Service title link navigates to the Landing page when unauthenticated', async () => {
        const landingPage = await cookiesSettingsPage.clickPageHeaderLinkAsUnauthenticatedUser();
        expect(await landingPage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Landing page in a new tab when unauthenticated', async () => {
        const landingPage = await cookiesSettingsPage.clickPageHeaderLinkAsUnauthenticatedUserInNewTab();
        expect(await landingPage.isDisplayed()).toBe(true);
    });
});

test.describe('Cookies Settings Page - Service Title Link - Authenticated', () => {
    let cookiesSettingsPage: CookiesSettingsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        cookiesSettingsPage = await homePage.clickViewCookies();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Service title link navigates to the Home page when authenticated', async () => {
        const homePage = await cookiesSettingsPage.clickPageHeaderLinkAsAuthenticatedUser();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Home page in a new tab when authenticated', async () => {
        const homePage = await cookiesSettingsPage.clickPageHeaderLinkAsAuthenticatedUserInNewTab();
        expect(await homePage.isDisplayed()).toBe(true);
    });
});
