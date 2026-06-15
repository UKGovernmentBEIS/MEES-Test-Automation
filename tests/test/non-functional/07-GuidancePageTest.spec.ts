import { expect, test } from '../../fixtures/authFixtures';
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

    test('How PRS properties are identified guidance content should meet page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.GUIDANCE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();
        await guidanceMainPage.clickTemplateLink(TemplateTypes.HOW_PRS_PROPERTIES_ARE_IDENTIFIED);

        // Capture the full article. The content is static guidance prose, so any change should be
        // flagged; only the dynamic Published/Last updated dates are auto-matched as patterns.
        await expect(page.locator('#main-content')).toMatchAriaSnapshot();
    });

    test('Each guidance template link should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.GUIDANCE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();

        for (const templateType of Object.values(TemplateTypes)) {
            // Click on the template link to navigate to the template page
            const templatePage = await guidanceMainPage.clickTemplateLink(templateType);

            // Verify correct page is displayed
            const headingText = await templatePage.getPageHeadingText();
            expect(headingText,
                `Expected page heading to be "${templateType}", but found "${headingText}" instead.`)
                .toBe(templateType);

            // Verify accessibility on the template page
            await baseTest.verifyAccessibility(guidanceMainPage.getPageNameForTemplate(templateType));

            // Verify page context on the template page
            const locators = await templatePage.getPageContextLocator();
            await baseTest.verifyContextWithLocators(locators);

            // Navigate back to the Guidance Main page for the next iteration
            await templatePage.clickGuidanceBreadcrumb();
            expect(await guidanceMainPage.isDisplayed(),
                `Expected to be back on the Guidance Main page after clicking breadcrumb, but it was not displayed.`)
                .toBeTruthy();
        }
    });
});