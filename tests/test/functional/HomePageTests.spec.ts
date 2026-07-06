import { test, expect } from '../../fixtures/authFixtures';
import { test as baseTest } from '@playwright/test';
import { HomePage } from '../../pages/Compliance/HomePage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { PenaltyCalculatorPage } from '../../pages/Compliance/PenaltyCalculatorPage';
import { TemplatesPage } from '../../pages/Compliance/TemplatesPage';
import { GuidanceMainPage } from '../../pages/Compliance/Guidance/GuidanceMainPage';
import { SupportWhoAreYouPage } from '../../pages/Compliance/Support/SupportWhoAreYouPage';
import { ProfileSettingsPage } from '../../pages/Compliance/ProfileSettingsPage';
import { LandingPage } from '../../pages/LandingPage';
import { PRSELandingPage } from '../../pages/PRSELandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import fs from 'fs';
import path from 'path';

function getDualAccessCredentials(): { email: string; password: string } {
    const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
    const dualAccessAccount = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).dualAccessAccount;

    const email = process.env[dualAccessAccount.email];
    const password = process.env[dualAccessAccount.password];

    if (!email || !password) {
        throw new Error(
            `Dual access account credentials not set. ` +
            `Expected env vars: ${dualAccessAccount.email}, ${dualAccessAccount.password}`
        );
    }
    return { email, password };
}

test.describe('Home Page Functional Tests', () => {
    let landingPage: LandingPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('Home page loads successfully', async ({ page }, testInfo) => {
        
        // Test that Sign In navigates to home page successfully
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();

        // Verify Home Page URL
        await expect(page).toHaveURL(/.*landing-page/);

        // Check console errors on Home Page
        // Number of console errors is currently expected to be less than 8 due to known issue MEESALPHA-577.
        const homePageErrors = homePage.getAllConsoleErrors();
        await expect(homePageErrors.length, 
            'Known Issue MEESALPHA-577: Home Page should have less than 8 console errors'
        ).toBeLessThan(8);

        // Verify page title
        // Known Issue MEESCH-584 - Home Page title is incorrectly set to "Landing Page"
        // Expecting the title to be "Landing Page" due to the known issue
        await expect(page).toHaveTitle('Check if properties meet standards');
    });
});

test.describe('Home Page Navigation Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    // Close any extra tabs opened during each test to prevent stray tabs
    // from interfering with subsequent tests in the same worker.
    test.afterEach(async ({ page }) => {
        const extraPages = page.context().pages().filter(p => p !== page);
        for (const extraPage of extraPages) {
            await extraPage.close();
        }
    });

    test('Navigate to the Landing page using the service title link', async ({ page }) => {
        const landingPage = await homePage.clickPageHeaderLink();
        expect(await landingPage.isDisplayed()).toBeTruthy();
    });

    // MEES-1092: Middle-clicking the service title link opens the PRSE page instead of the MEES Landing page.
    // test.fail() marks this as an expected failure — it will turn red when the bug is fixed.
    test('Navigate to the Landing page displayed in a new tab using the service title link', async ({ page }) => {
        test.fail();
        const landingPage = await homePage.clickPageHeaderLinkInNewTab();
        expect(await landingPage.isDisplayed()).toBeTruthy();
    });

    test('Feedback link has the correct email address and subject', async ({ page }) => {
        const href = await homePage.getFeedbackLink().getAttribute('href');
        expect(href).toBe('mailto:meesdigital@energysecurity.gov.uk?subject=Feedback');
    });

    test('Navigate to the Profile Settings page using the Profile Settings link', async ({ page }) => {
        const profileSettingsPage: ProfileSettingsPage = await homePage.clickProfileSettings();
        expect(await profileSettingsPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Profile Settings page displayed in a new tab using the Profile Settings link', async ({ page }) => {
        const profileSettingsPage: ProfileSettingsPage = await homePage.clickProfileSettingsInNewTab();
        expect(await profileSettingsPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Filter Properties page using the Property Records navigation tab', async ({ page }) => {
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickOnPropertyRecordsTab();
        expect(await filterPropertiesPage.isDisplayed()).toBeTruthy();
    });

    // MEES-1089: Opening main navigation links in a new tab loads the Landing page.
    // test.fail() marks these as expected failures — they will turn red when the bug is fixed.
    test('Navigate to the Filter Properties page displayed in a new tab using the Property Records navigation tab', async ({ page }) => {
        test.fail();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickOnPropertyRecordsTabInNewTab();
        expect(await filterPropertiesPage.isDisplayed()).toBeTruthy();
    });

    // MEES-1089: Opening main navigation links in a new tab loads the Landing page.
    // test.fail() marks these as expected failures — they will turn red when the bug is fixed.
    test('Navigate to the Guidance page displayed in a new tab using the Guidance navigation tab', async ({ page }) => {
        test.fail();
        const guidanceMainPage: GuidanceMainPage = await homePage.clickOnGuidanceTabInNewTab();
        expect(await guidanceMainPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Penalty Calculator page using the Penalty Calculator navigation tab', async ({ page }) => {
        const penaltyCalculatorPage = await homePage.clickOnPenaltyCalculatorTab();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });

    // MEES-1089: Opening main navigation links in a new tab loads the Landing page.
    // test.fail() marks these as expected failures — they will turn red when the bug is fixed.
    test('Navigate to the Penalty Calculator page displayed in a new tab using the Penalty Calculator navigation tab', async ({ page }) => {
        test.fail();
        const penaltyCalculatorPage: PenaltyCalculatorPage = await homePage.clickOnPenaltyCalculatorTabInNewTab();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });

    // MEES-1089: Opening main navigation links in a new tab loads the Landing page.
    // test.fail() marks these as expected failures — they will turn red when the bug is fixed.
    test('Navigate to the Templates page displayed in a new tab using the Templates navigation tab', async ({ page }) => {
        test.fail();
        const templatesPage: TemplatesPage = await homePage.clickOnTemplatesTabInNewTab();
        expect(await templatesPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Filter Properties page displayed in a new tab using the View property records link', async ({ page }) => {
        const filterPropertiesPage = await homePage.clickViewPropertiesInNewTab();
        expect(await filterPropertiesPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Guidance page displayed in a new tab using the View guidance link', async ({ page }) => {
        const guidanceMainPage = await homePage.clickViewGuidanceLinkInNewTab();
        expect(await guidanceMainPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Templates page displayed in a new tab using the View templates link', async ({ page }) => {
        const templatesPage = await homePage.clickViewTemplatesInNewTab();
        expect(await templatesPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Penalty Calculator page displayed in a new tab using the View penalty calculator link', async ({ page }) => {
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculatorInNewTab();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Support page using the Support link', async ({ page }) => {
        const supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        expect(await supportWhoAreYouPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Support page displayed in a new tab using the Support link', async ({ page }) => {
        const supportWhoAreYouPage = await homePage.clickRequestSupportLinkInNewTab();
        expect(await supportWhoAreYouPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Support page displayed in a new tab using the footer Help link', async ({ page }) => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickFooterHelpLinkInNewTab();
        expect(await supportWhoAreYouPage.isDisplayed()).toBeTruthy();
    });

    test('Open Government Licence link opens in a new tab', async ({ page }) => {
        const newTab = await homePage.clickOpenGovernmentLicenceLink();
        await expect(newTab).toHaveURL(/open-government-licence/);
    });
});

baseTest.describe('Dual Access User - MEES Tests', () => {
    baseTest.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    baseTest('Dual-access user can sign in to MEES and reach the home page', async ({ page }) => {
        const { email, password } = getDualAccessCredentials();

        const landingPage = new LandingPage(page);
        await landingPage.navigate();

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        const homePage = await loginPasswordPage.enterPasswordAndContinueToComplianceLandingPage(password);

        await expect(page).toHaveURL(/.*landing-page/);
        expect(await homePage.isDisplayed()).toBeTruthy();
    });
});

baseTest.describe('Dual Access User - PRSE Tests', () => {
    baseTest.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    baseTest('Dual-access user can sign in to PRSE and reach the PRSE home page', async ({ page }) => {
        const { email, password } = getDualAccessCredentials();

        // PRSE runs on the same host as MEES, under /PRSELocalAuthority/ instead of /compliance/.
        // Derive it from BASE_URL (which CI already provides) so no separate PRSE_BASE_URL secret is needed.
        const prseBaseUrl = process.env.PRSE_BASE_URL
            || process.env.BASE_URL?.replace('/compliance/', '/PRSELocalAuthority/');
        if (!prseBaseUrl) {
            throw new Error('PRSE URL could not be resolved: neither PRSE_BASE_URL nor BASE_URL is set');
        }

        await page.goto(prseBaseUrl);
        const prseLandingPage = new PRSELandingPage(page);
        await prseLandingPage.waitForPageToLoad();

        // The PRSE landing page uses a "Start now" button which leads into the One Login sign-in flow
        const signInOrCreatePage = await prseLandingPage.clickStartNow();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        await loginPasswordPage.enterPassword(password);
        await loginPasswordPage.clickContinue();

        // Confirm the dual-access user reaches the authenticated PRSE dashboard
        await expect(page).toHaveURL(/\/PRSELocalAuthority\/dashboard/);
        await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible({ timeout: 15000 });
    });
});