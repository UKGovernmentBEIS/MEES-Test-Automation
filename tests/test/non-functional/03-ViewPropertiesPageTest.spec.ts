import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('View Properties Page Non-Functional Tests', () => {

  test('View Properties Page', async ({ page }, testInfo) => {
    const baseTest = new BaseNonFunctionalTest(page, testInfo);
    baseTest.addTestAnnotations(PageName.VIEW_PROPERTIES_PAGE);

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();
    const filterPropertiesPage = await homePage.clickViewProperties();
    // Set street filter to invalid value to ensure there are no results
    await filterPropertiesPage.setStreetFilter('Invalid Street Name');
    const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

    // Verify accessibility on the View Properties page
    await baseTest.verifyAccessibility(PageName.VIEW_PROPERTIES_PAGE);

    // Verify page context on the View Properties page
    const locators = await viewPropertiesPage.getPageContextLocator();
    await baseTest.verifyContextWithLocators(locators);
  });
});