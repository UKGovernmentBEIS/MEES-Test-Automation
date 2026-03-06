import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName } from '../../utils/TestTypes';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Property Details Page Non-Functional Tests', () => {

    test('Details page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PROPERTY_DETAILS_PAGE);

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
        await baseTest.verifyAccessibility(PageName.PROPERTY_DETAILS_PAGE);

        // Verify page context on the Property Details page
        const locators = await propertyDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});