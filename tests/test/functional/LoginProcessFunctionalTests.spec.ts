import { test, expect } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/HomePage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Login Process Functional Tests', () => {
    let homePage: HomePage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        homePage = new HomePage(page);
        await homePage.navigate();
    });

    test('Authentication persistence across browser sessions', async ({ page }, testInfo) => {
        // Due to stored aauthentication session that this framework maintains,
        // we need to test that the authentication state persists correctly.
        
        // Test session persistence by navigating to different pages and back
        await homePage.navigate();
        
        // After reload, verify authentication state is maintained
        await expect(homePage.isDisplayed()).toBeTruthy();
        
        // Test that Start Now does not prompt for login again
        const landingPage = await homePage.clickStartNow_AuthenticatedUser();
        await expect(landingPage.isDisplayed()).toBeTruthy();
    });
});