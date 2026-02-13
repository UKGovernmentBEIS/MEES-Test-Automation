import { test, expect } from '../../fixtures/authFixtures';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
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
        // Number of console errors is currently expected to be less than 4 due to known issue MEESALPHA-608.
        const filterPropertiesPageErrors = filterPropertiesPage.getAllConsoleErrors();
        await expect(filterPropertiesPageErrors.length, 
            'Known Issue MEESALPHA-608: The Filter Properties page shows console errors'
        ).toBeLessThan(4);

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

    test('Apply multiple filters and verify filter summary on View Properties page', async ({ page }, testInfo) => {
        // Set up test data for filter criteria
        const councilFilter = 'LONDON BOROUGH OF BARNET';
        const energyRatingFilter = 'A';
        const streetFilter = 'Acorn Industrial Park';
        const townFilter = 'Brighton';
        const postcodeFilter = 'BN1 1AA';
        const landlordLocation = 'Onshore';

        // Populate filter criteria on the Filter Properties page
        await filterPropertiesPage.setCouncilFilter(councilFilter);
        await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
        await filterPropertiesPage.setStreetFilter(streetFilter);
        await filterPropertiesPage.setTownFilter(townFilter);
        await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
        await filterPropertiesPage.selectOnshoreLALocations();

        // Apply the filters using clickApplyFilters method
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

        // Verify filter summary on the View Properties page using LocatorAssertions
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Council')).toContainText(councilFilter);
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Energy rating')).toContainText(energyRatingFilter);
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Street')).toContainText(streetFilter);
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Town')).toContainText(townFilter);
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Postcode')).toContainText(postcodeFilter);
        await expect(await viewPropertiesPage.getFilterCriterionValueField('Landlord location')).toContainText(landlordLocation);
    });

    test('Ensure filter criteria are persistent when navigating back to Filter Properties page', async ({ page }, testInfo) => {
        // Set up test data for filter criteria
        const councilFilter = 'LONDON BOROUGH OF BARNET';
        const energyRatingFilter = 'A';
        const streetFilter = 'Acorn Industrial Park';
        const townFilter = 'Brighton';
        const postcodeFilter = 'BN1 1AA';

        // Populate filter criteria on the Filter Properties page
        await filterPropertiesPage.setCouncilFilter(councilFilter);
        await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
        await filterPropertiesPage.setStreetFilter(streetFilter);
        await filterPropertiesPage.setTownFilter(townFilter);
        await filterPropertiesPage.setPostcodeFilter(postcodeFilter);

        // Apply the filters using clickApplyFilters method
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

        // Navigate back to the Filter Properties page
        const returnedFilterPropertiesPage: FilterPropertiesPage = await viewPropertiesPage.clickChangeFilters();

        // Verify that the previously selected filter criteria are still populated
        // Bug: MEESALPHA-614 'The Council filter is not persistent'
        expect(await returnedFilterPropertiesPage.getSelectedCouncilFilter()).toBe('Show all councils');
        expect(await returnedFilterPropertiesPage.getSelectedEnergyRatingFilter()).toBe(energyRatingFilter);
        expect(await returnedFilterPropertiesPage.getStreetFilterValue()).toBe(streetFilter);
        expect(await returnedFilterPropertiesPage.getTownFilterValue()).toBe(townFilter);
        expect(await returnedFilterPropertiesPage.getPostcodeFilterValue()).toBe(postcodeFilter);
    });

    test('Ensure filter criteria are NOT persistent when navigating back to Filter Properties page using breadcrumb link', async ({ page }, testInfo) => {
        // Set up test data for filter criteria
        const councilFilter = 'LONDON BOROUGH OF BARNET';
        const energyRatingFilter = 'A';
        const streetFilter = 'Acorn Industrial Park';
        const townFilter = 'Brighton';
        const postcodeFilter = 'BN1 1AA';

        // Populate filter criteria on the Filter Properties page
        await filterPropertiesPage.setCouncilFilter(councilFilter);
        await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
        await filterPropertiesPage.setStreetFilter(streetFilter);
        await filterPropertiesPage.setTownFilter(townFilter);
        await filterPropertiesPage.setPostcodeFilter(postcodeFilter);

        // Apply the filters using clickApplyFilters method
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();

        // Navigate back to the Filter Properties page using the breadcrumb link
        filterPropertiesPage = await viewPropertiesPage.clickBreadcrumbFilterProperties();

        // Verify that the filter criteria have been reset when navigating back to Filter Properties page
        expect(await filterPropertiesPage.getSelectedCouncilFilter()).toBe('Show all councils');
        expect(await filterPropertiesPage.getSelectedEnergyRatingFilter()).toBe('All energy ratings');
        expect(await filterPropertiesPage.getStreetFilterValue()).toBe('');
        expect(await filterPropertiesPage.getTownFilterValue()).toBe('');
        expect(await filterPropertiesPage.getPostcodeFilterValue()).toBe('');
    });

    // This test requires explicit selection of LA users with council associations.
    // Please go to the '/Documentation/Authentication.md' document for instructions on how to set up and run this test.
    test('Verify councils list', async ({ page }, testInfo) => {
        // Verify that the councils list is displayed when clicking the link
        const councilsList = await filterPropertiesPage.getLACouncilsList();

        // Verify that the LA has two councils associated with it and that they are the expected councils
        expect(councilsList.length).toBe(2);
        await expect(councilsList[0]).toContainText('LONDON BOROUGH OF BARNET');
        await expect(councilsList[1]).toContainText('LONDON BOROUGH OF BEXLEY');
    });

    test('Navigate to the Home page using the breadcrumb link', async ({ page }, testInfo) => {
        // Click the Home breadcrumb link
        const homePage: HomePage = await filterPropertiesPage.clickBreadcrumbHome();
        
        // Verify that the Home page loads successfully
        await homePage.waitForPageToLoad();
        await expect(homePage.isDisplayed()).resolves.toBeTruthy();
    });
});