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

    test('Verify that the Reset filter button resets all filters', async ({ page }, testInfo) => {
        // Apply various filters first
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BARNET');
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.setStreetFilter('Acorn Industrial Park');
        await filterPropertiesPage.setTownFilter('Brighton');
        await filterPropertiesPage.setPostcodeFilter('BN1 1AA');
        await filterPropertiesPage.selectOnshoreLALocations();

        // Click the Reset filters button
        await filterPropertiesPage.clickClearFilters();

        // Verify all filters have been reset
        expect(await filterPropertiesPage.getSelectedCouncilFilter()).toBe('Show all councils');
        expect(await filterPropertiesPage.getSelectedEnergyRatingFilter()).toBe('All energy ratings');
        expect(await filterPropertiesPage.getStreetFilterValue()).toBe('');
        expect(await filterPropertiesPage.getTownFilterValue()).toBe('');
        expect(await filterPropertiesPage.getPostcodeFilterValue()).toBe('');
        
        // Verify radio button has reset to default (All locations)
        const allLARadio = page.getByRole('radio', { name: 'All locations' });
        await expect(allLARadio).toBeChecked();
    });
});