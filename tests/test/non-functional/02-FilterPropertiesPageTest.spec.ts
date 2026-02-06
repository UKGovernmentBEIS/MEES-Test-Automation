import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Filter Properties Page Non-Functional Tests', () => {

  test('Filter Properties Page', async ({ page }) => {
    test.info().annotations.push(
        TestAnnotations.page(PageName.FILTER_PROPERTIES_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();
    const filterPropertiesPage = await homePage.clickViewProperties();

    // Verify accessibility on the Filter Properties page
    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Filter Properties page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

    // Context Verification: Verify presence of key elements on the Filter Properties page
    await expect(filterPropertiesPage.getPageContextLocator()).toMatchAriaSnapshot();
  });
});