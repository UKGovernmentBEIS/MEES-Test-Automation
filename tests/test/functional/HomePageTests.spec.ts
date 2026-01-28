import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Home Page Functional Tests', () => {
    let landingPage: LandingPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('Home page loads successfully', async ({ page }, testInfo) => {
        
        // Test that Start Now navigates to home page successfully
        const homePage = await landingPage.clickStartNow_AuthenticatedUser();

        // Verify Home Page URL
        await expect(page).toHaveURL(/.*landing-page/);

        // Check console errors on Home Page
        const homePageErrors = homePage.getConsoleErrors();
        expect(homePageErrors.length, `Found ${homePageErrors.length} console errors on Home Page: ${homePageErrors.join(', ')}`).toBe(0);
    });
});