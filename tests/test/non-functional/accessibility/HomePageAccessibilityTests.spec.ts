import { test, expect } from '../../../fixtures/authFixtures';
import { HomePage } from '../../../pages/HomePage';
import { AccessibilityUtilities } from '../../../utils/AccessibilityUtilities';

test.describe('Home Page Accessibility Tests', () => {
  test('Home Page Accessibility Test', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const results = await AccessibilityUtilities.analyzeAccessibility(page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
  });
});