import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Home Page Non-Functional Tests', () => {

  test('Home Page', async ({ page }) => {
    test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();

    // Verify accessibility on the Home page
    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

    // Context Verification: Verify presence of key elements on the Home page
    // Itterate through all locators returned by getPageContextLocator and check if they are visible
    const contextLocators = await homePage.getPageContextLocator();
    for (const locator of contextLocators) {
        await expect(locator).toMatchAriaSnapshot();
    }
  });
});