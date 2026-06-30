import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { GuidanceArticles } from '../../pages/Compliance/Guidance/GuidanceMainPage';

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

    test('Each guidance article page should meet accessibility standards and page context requirements', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.GUIDANCE_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();

        for (const article of Object.values(GuidanceArticles)) {
            // Click on the guidance article link to navigate to the article page
            const articlePage = await guidanceMainPage.clickGuidanceArticle(article);

            // Verify correct page is displayed
            const headingText = await articlePage.getPageHeadingText();
            expect(headingText,
                `Expected page heading to be "${article}", but found "${headingText}" instead.`)
                .toBe(article);

            // Verify accessibility on the article page
            await baseTest.verifyAccessibility(guidanceMainPage.getPageNameForGuidanceArticle(article));

            // Verify page context on the article page
            const locators = await articlePage.getPageContextLocator();
            await baseTest.verifyContextWithLocators(locators);

            // Navigate back to the Guidance Main page for the next iteration
            await articlePage.clickGuidanceBreadcrumb();
            expect(await guidanceMainPage.isDisplayed(),
                `Expected to be back on the Guidance Main page after clicking breadcrumb, but it was not displayed.`)
                .toBeTruthy();
        }
    });
});