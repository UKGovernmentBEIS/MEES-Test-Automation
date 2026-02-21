import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PropertyDetailsPage } from '../../pages/Compliance/PropertyDetailsPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';

test.describe('View Properties Page Tests', () => {
    let viewPropertiesPage: ViewPropertiesPage;
    let propertyDetailsPage: PropertyDetailsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.selectOnshoreLALocations();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    test('The Property Details page is displayed', async () => {
        // Verify that we are on the Property Details page
        expect(await propertyDetailsPage.isDisplayed()).toBeTruthy();
    });
});