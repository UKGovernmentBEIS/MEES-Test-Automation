import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PrivacyNoticePage } from '../../pages/Compliance/PrivacyNoticePage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Privacy Notice Page - Unauthenticated', () => {
    let privacyNoticePage: PrivacyNoticePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        // Sign in then explicitly sign out to guarantee an unauthenticated session,
        // then open the Privacy Notice page from the Landing page footer.
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        await homePage.waitForPageToLoad();
        const newLandingPage = await homePage.clickSignOutButton();
        await newLandingPage.waitForPageToLoad();
        privacyNoticePage = await newLandingPage.clickFooterPrivacyNoticeLink();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Footer Privacy Notice link opens the Privacy Notice page when unauthenticated', async () => {
        expect(await privacyNoticePage.isDisplayed()).toBe(true);
    });

    test('Service title link navigates to the Landing page when unauthenticated', async () => {
        const landingPage = await privacyNoticePage.clickPageHeaderLinkAsUnauthenticatedUser();
        expect(await landingPage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Landing page in a new tab when unauthenticated', async () => {
        const landingPage = await privacyNoticePage.clickPageHeaderLinkAsUnauthenticatedUserInNewTab();
        expect(await landingPage.isDisplayed()).toBe(true);
    });
});

test.describe('Privacy Notice Page - Authenticated', () => {
    let privacyNoticePage: PrivacyNoticePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        privacyNoticePage = await homePage.clickFooterPrivacyNoticeLink();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Footer Privacy Notice link opens the Privacy Notice page when authenticated', async () => {
        expect(await privacyNoticePage.isDisplayed()).toBe(true);
    });

    test('Service title link navigates to the Home page when authenticated', async () => {
        const homePage = await privacyNoticePage.clickPageHeaderLinkAsAuthenticatedUser();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Home page in a new tab when authenticated', async () => {
        const homePage = await privacyNoticePage.clickPageHeaderLinkAsAuthenticatedUserInNewTab();
        expect(await homePage.isDisplayed()).toBe(true);
    });
});
