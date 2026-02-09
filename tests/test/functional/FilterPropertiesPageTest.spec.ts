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
        ).toBe(3);

        // Verify page title
        await expect(page).toHaveTitle('Filter properties');
    });

    // Activate on QA evironment where users with proper data are setup
    test.skip('Verify that the Reset filter button resets all filters', async ({ page }, testInfo) => {
        // Apply various filters first
        await filterPropertiesPage.setCouncilFilter('Adur District Council');
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.setStreetFilter('High Street');
        await filterPropertiesPage.setTownFilter('Brighton');
        await filterPropertiesPage.setPostcodeFilter('BN1 1AA');
        await filterPropertiesPage.selectOnshoreLALocations();
        
        // Check the radio button selection
        const onshoreLARadio = page.getByRole('radio', { name: 'Onshore (England and Wales)' });
        await expect(onshoreLARadio).toBeChecked();

        // Click the Reset filters button
        await filterPropertiesPage.clickClearFilters();

        // Verify all filters have been reset
        await expect(await filterPropertiesPage.getSelectedCouncilFilter()).toBe('');
        await expect(await filterPropertiesPage.getSelectedEnergyRatingFilter()).toBe('');
        await expect(await filterPropertiesPage.getStreetFilterValue()).toBe('');
        await expect(await filterPropertiesPage.getTownFilterValue()).toBe('');
        await expect(await filterPropertiesPage.getPostcodeFilterValue()).toBe('');
        
        // Verify radio button has reset to default (All locations)
        const allLARadio = page.getByRole('radio', { name: 'All locations' });
        await expect(allLARadio).toBeChecked();
    });
});