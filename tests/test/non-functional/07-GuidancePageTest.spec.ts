import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { GuidanceMainPage, TemplateTypes } from '../../pages/Compliance/Guidance/GuidanceMainPage';

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

    test('Each guidance template link should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.GUIDANCE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();

        Object.values(TemplateTypes).forEach(async (templateType) => {
            // Click on the template link to navigate to the template page
            const templatePage = await guidanceMainPage.clickTemplateLink(templateType);

            // Verify accessibility on the template page
            await baseTest.verifyAccessibility(guidanceMainPage.getPageNameForTemplate(templateType));

            // Verify page context on the template page
            const locators = await templatePage.getPageContextLocator();
            await baseTest.verifyContextWithLocators(locators);

            // Navigate back to the Guidance Main page for the next iteration
            await templatePage.clickGuidanceBreadcrumb();
        });
    });
});