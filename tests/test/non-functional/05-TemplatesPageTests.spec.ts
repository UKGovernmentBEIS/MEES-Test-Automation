import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test.describe('Templates Page Non-Functional Tests', () => {

    test('Templates page should meet accessibility standards and page context requirements', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.TEMPLATES_PAGE)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const templatesPage = await homePage.clickViewTemplates();

        // Verify accessibility on the Templates page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Templates page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Templates page
        // Itterate through all locators returned by getPageContextLocator and check if they are visible
        const contextLocators = await templatesPage.getPageContextLocator();
        for (const locator of contextLocators) {
            await expect(locator).toMatchAriaSnapshot();
        }
    });
});