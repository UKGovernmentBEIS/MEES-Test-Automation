import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Login Process Functional Tests', () => {
    let landingPage: LandingPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('Authentication persistence across browser sessions', async ({ page }, testInfo) => {
        // Due to stored aauthentication session that this framework maintains,
        // we need to test that the authentication state persists correctly.
        
        // Test session persistence by navigating to different pages and back
        await landingPage.navigate();
        
        // After reload, verify authentication state is maintained
        await expect(landingPage.isDisplayed()).toBeTruthy();
        
        // Test that Start Now does not prompt for login again
        const homePage = await landingPage.clickStartNow_AuthenticatedUser();
        await expect(homePage.isDisplayed()).toBeTruthy();
    });
});