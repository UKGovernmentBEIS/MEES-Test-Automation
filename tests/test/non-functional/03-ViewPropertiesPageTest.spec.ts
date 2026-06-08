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
    // The street filter does partial matching, so a real-word value (e.g. "Invalid Street Name")
    // matches many addresses. Use a nonsense token that cannot match any address to guarantee the
    // "no results" state the test relies on.
    await filterPropertiesPage.setStreetFilter('ZZZZZZZZ');
    const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

    // Verify accessibility on the View Properties page
    await baseTest.verifyAccessibility(PageName.VIEW_PROPERTIES_PAGE);

    // Verify page context on the View Properties page
    const locators = await viewPropertiesPage.getPageContextLocator();
    await baseTest.verifyContextWithLocators(locators);
  });
});