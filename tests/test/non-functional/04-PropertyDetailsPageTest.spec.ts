import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test.describe('Property Details Page Non-Functional Tests', () => {

    test('Details page', async ({ page }) => {
        test.info().annotations.push(
        TestAnnotations.page(PageName.HOME_PAGE),
        TestAnnotations.testType(TestType.ACCESSIBILITY),
        TestAnnotations.page(PageName.PROPERTY_DETAILS_PAGE)
        );

        // Navigate to the Property Details page
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.selectOnshoreLALocations();
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        const propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');

        // Verify accessibility on the Property Details page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `Property Details page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the Property Details page
        await expect(propertyDetailsPage.getPageContextLocator()).toMatchAriaSnapshot();
    });
});