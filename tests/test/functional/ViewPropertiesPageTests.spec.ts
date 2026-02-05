import { test, expect } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('View Properties Page Functional Tests', () => {
    let ViewPropertiesPage: ViewPropertiesPage;;
    
    // test.beforeEach(async ({ page }, testInfo) => {
    //     testInfo.annotations.push(
    //         TestAnnotations.testType(TestType.FUNCTIONAL)
    //     );
        
    //     const landingPage: LandingPage = new LandingPage(page);
    //     await landingPage.navigate();
    //     const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
    //     ViewPropertiesPage = await homePage.clickViewProperties();        
    // });

    test.skip('View Properties page loads successfully', async ({ page }, testInfo) => {
        // Verify Home Page URL
        await expect(page).toHaveURL(/.*view-properties/);

        // Check console errors on View Properties Page
        const viewPropertiesPageErrors = ViewPropertiesPage.getAllConsoleErrors();
        await expect(viewPropertiesPageErrors.length, 
            'Known Issue MEESCH-439: View Properties Page should have 3 console errors'
        ).toBe(0);

        // Verify page title
        await expect(page).toHaveTitle('View Properties');
    });
});