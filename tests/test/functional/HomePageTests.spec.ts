import { test, expect } from '../../fixtures/authFixtures';
import { test as baseTest } from '@playwright/test';
import { HomePage } from '../../pages/Compliance/HomePage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { LandingPage } from '../../pages/LandingPage';
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
        // Number of console errors is currently expected to be less than 4 due to known issue MEESALPHA-577.
        const homePageErrors = homePage.getAllConsoleErrors();
        await expect(homePageErrors.length, 
            'Known Issue MEESALPHA-577: Home Page should have less than 4 console errors'
        ).toBeLessThan(4);

        // Verify page title
        // Known Issue MEESCH-584 - Home Page title is incorrectly set to "Landing Page"
        // Expecting the title to be "Landing Page" due to the known issue
        await expect(page).toHaveTitle('Landing Page');
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

    test('Navigate to Filter Properties page from Home Page using the View Properties tab', async ({ page }) => {
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickOnPropertyRecordsTab();
        expect(await filterPropertiesPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to Penalty Calculator page from Home Page using the Penalty Calculator tab', async ({ page }) => {
        const penaltyCalculatorPage = await homePage.clickOnPenaltyCalculatorTab();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to the Support page from Home Page using the Support link', async ({ page }) => {
        const supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        expect(await supportWhoAreYouPage.isDisplayed()).toBeTruthy();
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

// Skipped until the PRSE site is fixed
baseTest.describe('Dual Access User - PRSE Tests', () => {
    baseTest.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    baseTest.skip('Dual-access user can sign in to PRSE and reach the PRSE home page', async ({ page }) => {
        const { email, password } = getDualAccessCredentials();

        const prseBaseUrl = process.env.PRSE_BASE_URL;
        if (!prseBaseUrl) {
            throw new Error('PRSE_BASE_URL environment variable is not set');
        }

        await page.goto(prseBaseUrl);
        const landingPage = new LandingPage(page);
        await landingPage.waitForPageToLoad();

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        const homePage = await loginPasswordPage.enterPasswordAndContinueToComplianceLandingPage(password);

        await expect(page).toHaveURL(new RegExp(prseBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        expect(await homePage.isDisplayed()).toBeTruthy();
    });
});