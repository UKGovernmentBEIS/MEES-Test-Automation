import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

test.describe('View Properties Page Tests', () => {
    let viewPropertiesPage: ViewPropertiesPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
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
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
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
        const filterPropertiesPage2 = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage2.waitForPageToLoad();
        await filterPropertiesPage2.selectOffshoreLALocations();
        viewPropertiesPage = await filterPropertiesPage2.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(viewPropertiesPage.getPropertyTableRow()).not.toBeVisible();

        // Change the Landrold Location filter to All and set the council filter to 'LONDON BOROUGH OF BARNET' and verify that no records are found
        const filterPropertiesPage3 = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage3.waitForPageToLoad();
        await filterPropertiesPage3.selectAllLALocations();
        await filterPropertiesPage3.setCouncilFilter('LONDON BOROUGH OF BARNET');
        viewPropertiesPage = await filterPropertiesPage3.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(viewPropertiesPage.getPropertyTableRow()).not.toBeVisible();
    });

    test('Breadcrumb navigation works correctly', async ({ page }) => {
        // Click on the Home breadcrumb link and verify navigation to Home Page
        const homePage = await viewPropertiesPage.clickBreadcrumbHome();
        await expect(homePage.isDisplayed()).resolves.toBeTruthy();

        // Navigate back to View Properties Page
        const filterPropertiesPage2 = await homePage.clickViewProperties();
        const viewPropertiesPage2 = await filterPropertiesPage2.clickApplyFilters();

        // Click on the Filter Properties breadcrumb link and verify navigation to Filter Properties Page
        const filterPropertiesPage3 = await viewPropertiesPage2.clickBreadcrumbFilterProperties();
        await expect(filterPropertiesPage3.isDisplayed()).resolves.toBeTruthy();
        
    });
    
    test('Pagination displays when data exceeds page limit', async ({ page }) => {
        
        await expect(viewPropertiesPage.getPaginationContainer()).toBeVisible();
        await expect(viewPropertiesPage.getNextPageButton()).toBeVisible();
    });

    test('Pagination next button navigates to next page correctly', async ({ page }) => {
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

    test('DMS Integration - UI and DMS data are matching', async ({ page, request }) => {
        // Set specific filter criteria to get manageable dataset
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setPostcodeFilter('DA1 3QQ');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        // Get total records count from UI (e.g., "12345 results")
        const displayedPropertiesLocator = await viewPropertiesPage.getPropertiesCountField();
        const uiResultsText = await displayedPropertiesLocator.textContent();
        const uiTotalRecords = parseInt(uiResultsText?.match(/(\d+)/)?.[1] || '0');

        // Make API call to DMS with same filters
        if (!process.env.DMS_BASE_URL || !process.env.PROPERTIES_KEY) {
            throw new Error('DMS_BASE_URL and PROPERTIES_KEY must be set in environment variables for this test');
        }
        const dmsApiUrl = `${process.env.DMS_BASE_URL}/mees/properties?page=1&size=10`;
        const apiResponse = await request.post(dmsApiUrl, {
            data: {
                "lacodes": ["E09000003","E09000004"],
                "postcode": "DA1 3QQ"
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        expect(apiResponse.status()).toBe(200);
        const apiResponseData = await apiResponse.json();

        // Double parsing required: API returns JSON-encoded string instead of proper JSON object
        // response.json() parses the outer JSON layer returning a string, then JSON.parse() gets the actual data
        const parsedResponseData = JSON.parse(apiResponseData);
        
        // Extract total records count from API response - use fallback if total_records is undefined
        const apiTotalRecords: number = parsedResponseData.total_records;

        // Compare total record counts
        expect(uiTotalRecords).toBe(apiTotalRecords);
    });

});