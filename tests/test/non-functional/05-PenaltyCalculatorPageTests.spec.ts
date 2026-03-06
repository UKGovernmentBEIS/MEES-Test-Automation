import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Penalty Calculator Page Non-Functional Tests', () => {

    test('Penalty Calculator page should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PENALTY_CALCULATOR_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();

        // Verify accessibility on the Penalty Calculator page
        await baseTest.verifyAccessibility(PageName.PENALTY_CALCULATOR_PAGE);

        // Verify page context on the Penalty Calculator page
        const locators = await penaltyCalculatorPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Penalty Calculator Results page should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PENALTY_CALCULATOR_RESULTS_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();
        const penaltyCalculatorResultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 1000);

        // Verify accessibility on the Penalty Calculator Results page
        await baseTest.verifyAccessibility(PageName.PENALTY_CALCULATOR_RESULTS_PAGE);

        // Verify page context on the Penalty Calculator Results page
        const locators = await penaltyCalculatorResultsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Penalty Calculator page with errors should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PENALTY_CALCULATOR_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();
        // Attempt to calculate maximum penalty without selecting length of breach and entering rateable value to trigger validation errors
        await penaltyCalculatorPage.clearRateableValue();
        await penaltyCalculatorPage.clickStartNewCalculation();
        // Verify that the Penatly Calculator page is still displayed
        // It means that the validation errors are triggered and displayed on the page
        expect(await penaltyCalculatorPage.isDisplayed()).toBe(true);

        // Verify accessibility on the Penalty Calculator page with errors
        await baseTest.verifyAccessibility(PageName.PENALTY_CALCULATOR_PAGE);

        // Verify page context on the Penalty Calculator page with errors
        const locators = await penaltyCalculatorPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});