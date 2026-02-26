import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Landing Page Non-Functional Tests', () => {

  test('Landing Page', async ({ page }) => {
    test.info().annotations.push(
        TestAnnotations.page(PageName.LANDING_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );

    const landingPage = new LandingPage(page);
    await landingPage.navigate();

    // Verify accessibility on the Landing page
    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Landing page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

    // Context Verification: Verify presence of key elements on the Landing page
    // Itterate through all locators returned by getPageContextLocator and check if they are visible
    const contextLocators = await landingPage.getPageContextLocator();
    for (const locator of contextLocators) {
        await expect(locator).toMatchAriaSnapshot();
    }
  });
});