import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { GuidanceMainPage } from '../../pages/Compliance/Guidance/GuidanceMainPage';

test.describe('Guidance Main Page', () => {
    let guidanceMainPage: GuidanceMainPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        guidanceMainPage = await homePage.clickGuidanceLink();
    });

    test('should display the Guidance Main Page', async () => {
        await guidanceMainPage.waitForPageToLoad();
        const isDisplayed = await guidanceMainPage.isDisplayed();
        expect(isDisplayed).toBeTruthy();
    });
});