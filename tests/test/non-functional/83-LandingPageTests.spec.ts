import { test } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Landing Page Non-Functional Tests', () => {

  test('Landing Page', async ({ page }, testInfo) => {
    const baseTest = new BaseNonFunctionalTest(page, testInfo);
    baseTest.addTestAnnotations(PageName.LANDING_PAGE);

    const landingPage = new LandingPage(page);
    await landingPage.navigate();

    // Verify accessibility on the Landing page
    await baseTest.verifyAccessibility(PageName.LANDING_PAGE);

    // Verify page context on the Landing page
    const locators = await landingPage.getPageContextLocator();
    await baseTest.verifyContextWithLocators(locators);
  });
});