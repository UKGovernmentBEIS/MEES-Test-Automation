import { test, expect } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/Compliance/HomePage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

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

test.describe('Home Page Navigation Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    // Bug 685: The 'Property Records' tab navigates to the Home page instead of the Filter Properties page
    test.skip('Navigate to Filter Properties page from Home Page using the View Properties tab', async ({ page }) => {
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickOnPropertyRecordsTab();
        expect(await filterPropertiesPage.isDisplayed()).toBeTruthy();
    });

    test('Navigate to Penalty Calculator page from Home Page using the Penalty Calculator tab', async ({ page }) => {
        const penaltyCalculatorPage = await homePage.clickOnPenaltyCalculatorTab();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });
});