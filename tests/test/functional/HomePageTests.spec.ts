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
        
        // Test that Sign In navigates to home page successfully
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();

        // Verify Home Page URL
        await expect(page).toHaveURL(/.*landing-page/);

        // Check console errors on Home Page
        // Number of console errors is currently expected to be less than 4 due to known issue MEESALPHA-577.
        const homePageErrors = homePage.getAllConsoleErrors();
        await expect(homePageErrors.length, 
            'Known Issue MEESALPHA-577: Home Page should have less than 4 console errors'
        ).toBeLessThan(4);

        // Verify page title
        // Known Issue MEESCH-584 - Home Page title is incorrectly set to "Landing Page"
        // Expecting the title to be "Landing Page" due to the known issue
        await expect(page).toHaveTitle('Landing Page');
    });
});