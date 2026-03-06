import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Home Page Non-Functional Tests', () => {

  test('Home Page', async ({ page }, testInfo) => {
    const baseTest = new BaseNonFunctionalTest(page, testInfo);
    baseTest.addTestAnnotations(PageName.HOME_PAGE);

    const landingPage = new LandingPage(page);
    await landingPage.navigate();
    const homePage = await landingPage.clickSignIn_AuthenticatedUser();

    // Verify accessibility on the Home page
    await baseTest.verifyAccessibility(PageName.HOME_PAGE);

    // Verify page context on the Home page
    const locators = await homePage.getPageContextLocator();
    await baseTest.verifyContextWithLocators(locators);
  });
});