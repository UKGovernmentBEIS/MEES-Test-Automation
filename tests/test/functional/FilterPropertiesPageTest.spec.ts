import { test, expect } from '../../fixtures/authFixtures';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

test.describe('Filter Properties Page Functional Tests', () => {
    let filterPropertiesPage: FilterPropertiesPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        filterPropertiesPage = await homePage.clickViewProperties();        
    });

    test('The Filter Properties page loads successfully', async ({ page }, testInfo) => {
        // Verify Home Page URL
        await expect(page).toHaveURL(/.*filter-properties/);

        // Check console errors on Filter Properties Page
        const filterPropertiesPageErrors = filterPropertiesPage.getAllConsoleErrors();
        await expect(filterPropertiesPageErrors.length, 
            'Known Issue MEESALPHA-608: The Filter Properties page shows console errors'
        ).toBe(1);

        // Verify page title
        await expect(page).toHaveTitle('Filter properties');
    });
});