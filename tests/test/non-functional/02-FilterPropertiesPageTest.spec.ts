import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Filter Properties Page Non-Functional Tests', () => {

  test('Filter Properties Page', async ({ page }, testInfo) => {
    const baseTest = new BaseNonFunctionalTest(page, testInfo);
    baseTest.addTestAnnotations(PageName.FILTER_PROPERTIES_PAGE);

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();
    const filterPropertiesPage = await homePage.clickViewProperties();

    // Verify accessibility on the Filter Properties page
    await baseTest.verifyAccessibility(PageName.FILTER_PROPERTIES_PAGE);

    // Verify page context on the Filter Properties page
    const locators = await filterPropertiesPage.getPageContextLocator();
    await baseTest.verifyContextWithLocators(locators);
  });
});