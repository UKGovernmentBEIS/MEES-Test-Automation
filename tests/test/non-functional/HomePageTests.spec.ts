import { test, expect } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/HomePage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Home Page Non-Functional Tests', () => {

  test('Home Page', async ({ page }, testInfo) => {
    test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );

    const homePage = new HomePage(page);
    await homePage.navigate();

    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
  });

});