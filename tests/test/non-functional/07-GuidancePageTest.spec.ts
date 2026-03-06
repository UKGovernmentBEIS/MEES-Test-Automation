import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Guidance Main Page Non-Functional Tests', () => {

    test('Guidance Main page should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.GUIDANCE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();

        // Verify accessibility on the Guidance Main page
        await baseTest.verifyAccessibility(PageName.GUIDANCE_PAGE);

        // Verify page context on the Guidance Main page
        const locators = await guidanceMainPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});