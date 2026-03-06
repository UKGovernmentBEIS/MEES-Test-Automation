import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Templates Page Non-Functional Tests', () => {

    test('Templates page should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.TEMPLATES_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const templatesPage = await homePage.clickViewTemplates();

        // Verify accessibility on the Templates page
        await baseTest.verifyAccessibility(PageName.TEMPLATES_PAGE);

        // Verify page context on the Templates page
        const locators = await templatesPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});