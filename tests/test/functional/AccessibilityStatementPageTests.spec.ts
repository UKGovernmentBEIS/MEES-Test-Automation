/*
 * Covers the Accessibility Statement page journeys for both unauthenticated and authenticated users,
 * including the footer Accessibility Statement link and the service-title link behaviour.
 */
import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityStatementPage } from '../../pages/Compliance/AccessibilityStatementPage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Accessibility Statement Page - Unauthenticated', () => {
    let accessibilityStatementPage: AccessibilityStatementPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        // Sign in then explicitly sign out to guarantee an unauthenticated session,
        // then open the Accessibility Statement page from the Landing page footer.
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        await homePage.waitForPageToLoad();
        const newLandingPage = await homePage.clickSignOutButton();
        await newLandingPage.waitForPageToLoad();
        accessibilityStatementPage = await newLandingPage.clickFooterAccessibilityStatementLink();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Footer Accessibility Statement link opens the Accessibility Statement page when unauthenticated', async () => {
        expect(await accessibilityStatementPage.isDisplayed()).toBe(true);
    });

    test('Service title link navigates to the Landing page when unauthenticated', async () => {
        const landingPage = await accessibilityStatementPage.clickPageHeaderLinkAsUnauthenticatedUser();
        expect(await landingPage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Landing page in a new tab when unauthenticated', async () => {
        // Opening a new tab and loading the Salesforce page is slow; allow more than the 30s
        // default so this does not time out under heavier CI load.
        test.setTimeout(60000);
        const landingPage = await accessibilityStatementPage.clickPageHeaderLinkAsUnauthenticatedUserInNewTab();
        expect(await landingPage.isDisplayed()).toBe(true);
    });
});

test.describe('Accessibility Statement Page - Authenticated', () => {
    let accessibilityStatementPage: AccessibilityStatementPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        accessibilityStatementPage = await homePage.clickFooterAccessibilityStatementLink();
    });

    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Footer Accessibility Statement link opens the Accessibility Statement page when authenticated', async () => {
        expect(await accessibilityStatementPage.isDisplayed()).toBe(true);
    });

    test('Service title link navigates to the Home page when authenticated', async () => {
        const homePage = await accessibilityStatementPage.clickPageHeaderLinkAsAuthenticatedUser();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Service title link opens the Home page in a new tab when authenticated', async () => {
        // Opening a new tab and loading the Salesforce page is slow; allow more than the 30s
        // default so this does not time out under heavier CI load.
        test.setTimeout(60000);
        const homePage = await accessibilityStatementPage.clickPageHeaderLinkAsAuthenticatedUserInNewTab();
        expect(await homePage.isDisplayed()).toBe(true);
    });
});
