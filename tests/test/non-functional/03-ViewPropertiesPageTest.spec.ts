import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('View Properties Page Non-Functional Tests', () => {

  test('View Properties Page', async ({ page }) => {
    test.info().annotations.push(
        TestAnnotations.page(PageName.VIEW_PROPERTIES_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();
    const filterPropertiesPage = await homePage.clickViewProperties();
    // Set street filter to invalid value to ensure there are no results
    await filterPropertiesPage.setStreetFilter('Invalid Street Name');
    const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

    // Verify accessibility on the View Properties page
    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `View Properties page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

    // Context Verification: Verify presence of key elements on the View Properties page
    // Itterate through all locators returned by getPageContextLocator and check if they are visible
    const contextLocators = await viewPropertiesPage.getPageContextLocator();
    for (const locator of contextLocators) {
        await expect(locator).toMatchAriaSnapshot();
    }
  });
});