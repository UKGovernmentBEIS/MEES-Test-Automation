import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

test.describe('View Properties Page Functional Tests', () => {
    let viewPropertiesPage: ViewPropertiesPage;;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
    });

    test('View Properties page loads successfully', async ({ page }, testInfo) => {
        // Verify Home Page URL
        await expect(page).toHaveURL(/.*view-properties?/);

        // Check console errors on View Properties Page
        // Number of console errors is currently expected to be less than 4 due to known issue MEESALPHA-577.
        const viewPropertiesPageErrors = viewPropertiesPage.getAllConsoleErrors();
        await expect(viewPropertiesPageErrors.length, 
            'TODO: Console errors should be investigated and resolved. If they are expected, this assertion can be removed or updated accordingly.'
        ).toBeLessThan(4);

        // Verify page title
        await expect(page).toHaveTitle('View Properties');
    });

    test('Page provides filtered data based on selected criteria', async ({ page }) => {
        let filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
        await filterPropertiesPage.setEnergyRatingFilter('B');
        await filterPropertiesPage.setStreetFilter('Crayford Road');
        await filterPropertiesPage.setTownFilter('DARTFORD');
        await filterPropertiesPage.setPostcodeFilter('DA1 4AL');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();

        // Verify that data displayed matches the applied filters
        const filteredDataRow = viewPropertiesPage.getPropertyTableRow().first();
        await expect(filteredDataRow).toBeVisible();
        await expect(filteredDataRow).toContainText('B');
        await expect(filteredDataRow).toContainText('Crayford Road');
        await expect(filteredDataRow).toContainText('DARTFORD');
        await expect(filteredDataRow).toContainText('DA1 4AL');

        // Change the Landrold Location filter to Offshore and verify that no records are found
        filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.waitForPageToLoad();
        await filterPropertiesPage.selectOffshoreLALocations();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(viewPropertiesPage.getPropertyTableRow()).not.toBeVisible();

        // Change the Landrold Location filter to All and set the council filter to 'LONDON BOROUGH OF BARNET' and verify that no records are found
        filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.waitForPageToLoad();
        await filterPropertiesPage.selectAllLALocations();
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BARNET');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(viewPropertiesPage.getPropertyTableRow()).not.toBeVisible();
    });

    test('Breadcrumb navigation works correctly', async ({ page }) => {
        // Click on the Filter Properties breadcrumb link and verify navigation to Filter Properties Page
        const filterPropertiesPage = await viewPropertiesPage.clickBreadcrumbViewProperties();
        await filterPropertiesPage.waitForPageToLoad();
        await expect(filterPropertiesPage.isDisplayed()).resolves.toBeTruthy();

        // Navigate back to View Properties Page
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();

        // Click on the Home breadcrumb link and verify navigation to Home Page
        const homePage = await viewPropertiesPage.clickBreadcrumbHome();
        await homePage.waitForPageToLoad();
        await expect(homePage.isDisplayed()).resolves.toBeTruthy();
    }
});

test.describe('Verify page pagination functionality', () => {
    let viewPropertiesPage: ViewPropertiesPage;;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();        
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad({ paginationContainer: viewPropertiesPage.getPaginationContainer() });
    });

    test('Pagination displays when data exceeds page limit', async ({ page }) => {
        const totalRecords = await viewPropertiesPage.getTotalRecordsCount();
        
        // Check if we have sufficient data for pagination testing
        if (totalRecords <= 30) {
            test.skip(true, `Skipping pagination test: Only ${totalRecords} records available. Need >30 for pagination.`);
        }
        
        await expect(viewPropertiesPage.getPaginationContainer()).toBeVisible();
        await expect(viewPropertiesPage.getNextPageButton()).toBeVisible();
    });

    test('Pagination next button navigates to next page correctly', async ({ page }) => {
        const totalRecords = await viewPropertiesPage.getTotalRecordsCount();
        
        // Check if we have sufficient data for pagination testing
        if (totalRecords <= 30) {
            test.skip(true, `Skipping pagination test: Only ${totalRecords} records available. Need >30 for pagination.`);
        }
        
        // Verify page 1 is current initially
        await expect(viewPropertiesPage.isPageCurrent(1)).toBeVisible();
        
        // Verify previous button is not visible on first page
        await expect(viewPropertiesPage.getPreviousPageButton()).not.toBeVisible();
        
        // Click next page
        await viewPropertiesPage.clickNextPage();
        
        // Verify page 1 is no longer current
        await expect(viewPropertiesPage.isPageCurrent(1)).not.toBeVisible();
        
        // Verify page 2 is now current
        await expect(viewPropertiesPage.isPageCurrent(2)).toBeVisible();
        
        // Verify previous button is now visible
        await expect(viewPropertiesPage.getPreviousPageButton()).toBeVisible();
    });

    test('Pagination previous button navigates to previous page correctly', async ({ page }) => {
        const totalRecords = await viewPropertiesPage.getTotalRecordsCount();
        
        // Check if we have sufficient data for pagination testing
        if (totalRecords <= 30) {
            test.skip(true, `Skipping pagination test: Only ${totalRecords} records available. Need >30 for pagination.`);
        }
        
        // Navigate to second page first
        await viewPropertiesPage.clickNextPage();
        
        // Verify page 2 is current
        await expect(viewPropertiesPage.isPageCurrent(2)).toBeVisible();
        
        // Click previous page
        await viewPropertiesPage.clickPreviousPage();
        
        // Verify page 2 is no longer current
        await expect(viewPropertiesPage.isPageCurrent(2)).not.toBeVisible();
        
        // Verify page 1 is now current
        await expect(viewPropertiesPage.isPageCurrent(1)).toBeVisible();
        
        // Verify previous button is not visible on first page
        await expect(viewPropertiesPage.getPreviousPageButton()).not.toBeVisible();
    });

    test('Last page navigation disables next button', async ({ page }) => {
        const totalRecords = await viewPropertiesPage.getTotalRecordsCount();
        
        // Ensure we have enough data to test last page navigation
        expect(totalRecords, 'Test requires more than 30 records to validate last page navigation').toBe(30);
        
        // Navigate to last page
        await viewPropertiesPage.navigateToLastPage();
        
        // Verify next button is not visible on last page
        await expect(viewPropertiesPage.getNextPageButton()).not.toBeVisible();
        
        // Verify previous button is visible
        await expect(viewPropertiesPage.getPreviousPageButton()).toBeVisible();
    });

    test('Pagination is not displayed when there are no records', async ({ page }) => {
        // Change filter criteria to return no results
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setTownFilter('NonExistentTown');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();

        // Verify no records are found
        await expect(viewPropertiesPage.getPropertyTableRow()).not.toBeVisible();

        // Verify pagination controls are not visible
        await expect(viewPropertiesPage.getPaginationContainer()).not.toBeVisible();
    });
});