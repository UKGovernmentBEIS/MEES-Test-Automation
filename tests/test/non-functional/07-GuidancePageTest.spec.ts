import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test.describe('Guidance Main Page Non-Functional Tests', () => {

    test('Guidance Main page should meet accessibility standards and page context requirements', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.GUIDANCE_PAGE)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();

        // Verify accessibility on the Guidance Main page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Guidance Main page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Guidance Main page
        // Itterate through all locators returned by getPageContextLocator and check if they are visible
        const contextLocators = await guidanceMainPage.getPageContextLocator();
        for (const locator of contextLocators) {
            await expect(locator).toMatchAriaSnapshot();
        }
    });
});