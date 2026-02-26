import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import { HomePage } from '../../pages/Compliance/HomePage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test.describe('Penalty Calculator Page Non-Functional Tests', () => {

    test('Penalty Calculator page should meet accessibility standards and page context requirements', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.PENALTY_CALCULATOR_PAGE)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();

        // Verify accessibility on the Penalty Calculator page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Penalty Calculator page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Penalty Calculator page
        // Itterate through all locators returned by getPageContextLocator and check if they are visible
        const contextLocators = await penaltyCalculatorPage.getPageContextLocator();
        for (const locator of contextLocators) {
            await expect(locator).toBeVisible();
        }
    });

    test('Penalty Calculator Results page should meet accessibility standards and page context requirements', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.PENALTY_CALCULATOR_RESULTS_PAGE)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();
        const penaltyCalculatorResultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 1000);

        // Verify accessibility on the Penalty Calculator Results page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Penalty Calculator Results page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Penalty Calculator Results page
        // Itterate through all locators returned by getPageContextLocator and check if they are visible
        const contextLocators = await penaltyCalculatorResultsPage.getPageContextLocator();
        for (const locator of contextLocators) {
            await expect(locator).toBeVisible();
        }
    });

    test('Penalty Calculator page with errors should meet accessibility standards and page context requirements', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.PENALTY_CALCULATOR_PAGE)
        );

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
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Penalty Calculator page with errors has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Penalty Calculator page with errors
        // Itterate through all locators returned by getPageContextLocator and check if they are visible
        const contextLocators = await penaltyCalculatorPage.getPageContextLocator();
        for (const locator of contextLocators) {
            await expect(locator).toBeVisible();
        }
    });
});