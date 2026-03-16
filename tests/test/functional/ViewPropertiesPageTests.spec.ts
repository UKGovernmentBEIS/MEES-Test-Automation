import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { PropertyData, ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
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
        await expect(await viewPropertiesPage.getNoRecordsFoundMessage()).toBeVisible();

        // Change the Landrold Location filter to All and set the council filter to 'LONDON BOROUGH OF BARNET' and verify that no records are found
        const filterPropertiesPage3 = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage3.waitForPageToLoad();
        await filterPropertiesPage3.selectAllLALocations();
        await filterPropertiesPage3.setCouncilFilter('LONDON BOROUGH OF BARNET');
        viewPropertiesPage = await filterPropertiesPage3.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(await viewPropertiesPage.getNoRecordsFoundMessage()).toBeVisible();
    });
    
    test('Pagination displays when data exceeds page limit', async ({ page }) => {
        
        await expect(await viewPropertiesPage.getPaginationContainer()).toBeVisible();
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
        await expect(await viewPropertiesPage.getNoRecordsFoundMessage()).toBeVisible();

        // Verify pagination controls are not visible
        await expect(await viewPropertiesPage.getPaginationContainer()).not.toBeVisible();
    });

    test('DMS Integration - UI and DMS data are matching', async ({ page, request }) => {
        // Set specific filter criteria to get manageable dataset
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setPostcodeFilter('DA1 3PY');
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
                "postcode": "DA1 3PY"
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

    test('Verify PRS Exemption data is displayed correctly in the table', async ({ page }) => {
        // Set specific filter criteria to get manageable dataset
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
        await filterPropertiesPage.setEnergyRatingFilter('A');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        // Get all property data from the table
        const propertiesData = await viewPropertiesPage.getPropertiesDataFromTable();

        // Search for a properties with below PRSE Exemption and verify the exemption and color are displayed correctly
        const exemptionToColorMapping: Record<string, string> = {
            'Penalty sent': 'light-blue',
            'Received': 'blue',
            'Approved': 'green',
            'Updated': 'orange',
            'Ended': 'pink',
            'Expired': 'grey',
            'Needs update': 'yellow',
            'Draft': 'blue',
            'Data not found': ''
        };

        const invalidExemptionsColors: string[] = [];

        Object.entries(exemptionToColorMapping).forEach(([exemption, expectedColor]) => {
            const property = propertiesData.find(p => p.PRSExemptions === exemption);
            if (!property) {
                invalidExemptionsColors.push(`No property with '${exemption}' exemption was found`);
            } else
            if (property.PRSEExemptionsColour !== expectedColor) {
                invalidExemptionsColors.push(`Exemption '${exemption}': expected '${expectedColor}', got '${property.PRSEExemptionsColour}'`);
            }
        });

        expect(invalidExemptionsColors, `Invalid PRS Exemptions colors found: ${invalidExemptionsColors.join(', ')}`).toEqual([]);
    });

    // Bug: 753 'Duplicated properties are displayed on the View Properties page'
    // Remove matching properties by Energy Rating (p.energyRating === energyRating) in the find condition 
    // until the underlying issue is resolved to avoid test failure due to duplicated records
    test('Verify Energy Ratings data', async ({ page, request }) => {
        // Make sure that all data are loaded first
        await viewPropertiesPage.waitForTableContent();

        // Get all property data from the table
        const propertiesData = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(propertiesData.length, 'No properties found in the table').toBeGreaterThan(0);

        // Get data from DMS API
        const url = process.env.DMS_BASE_URL + '/mees/properties?page=1&size=30';
        const requestBody = {
            "lacodes": ["E09000003","E09000004"]
        };
        const response = await request.post(`${url}`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Double parsing required: API returns JSON-encoded string instead of proper JSON object
        // response.json() parses the outer JSON layer returning a string, then JSON.parse() gets the actual data
        const apiResponseData = await response.json();
        const parsedResponseData = JSON.parse(apiResponseData);
        const apiProperties = parsedResponseData.data;

        const discrepancies: string[] = [];

        apiProperties.forEach((apiProperty: any) => {
            // Build address string in the same format as displayed in the UI
            const addressParts = [
                apiProperty.Number ? apiProperty.Number : '',
                apiProperty.FlatNameNumber ? apiProperty.FlatNameNumber : '',
                apiProperty.Line1 ? apiProperty.Line1 : '',
                apiProperty.Line2 ? apiProperty.Line2 : '',
                apiProperty.Line3 ? apiProperty.Line3 : '',
                apiProperty.Town ? apiProperty.Town : '',
                apiProperty.County ? apiProperty.County : '',
                apiProperty.Postcode ? apiProperty.Postcode : ''
            ].filter(part => part.trim() !== '');
            const address = addressParts.join(', ');

            // Concatenate energy rating. For example: C(55) - EPCEnergyRatingBand(EPCEnergyRating)
            const energyRating = `${apiProperty.EPCEnergyRatingBand} (${apiProperty.EPCEnergyRating})`;

            // Find the corresponding property data from the UI based on the address and compare energy ratings
            const propertyData = propertiesData.find(p => p.address === address && p.energyRating === energyRating );
            if (!propertyData) {
                discrepancies.push(`Property with address '${address}' found in API but not in UI. We have the following addresses in the UI: ${propertiesData.map(p => p.address).join('; ')}  `);
            } else
             if (propertyData.energyRating !== energyRating) {
                discrepancies.push(`Energy rating mismatch for '${address}': UI shows '${propertyData.energyRating}', API shows '${energyRating}'`);
            }
        });

        expect(discrepancies, `Discrepancies found: ${discrepancies.join(', ')}`).toEqual([]);
    });

    test('The Energy Ratings for not rated properties shows \'Unrated\'', async ({ page }) => {
        // Set specific filter criteria to get Unrated properties
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setEnergyRatingFilter('Unrated');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        // Get all property data from the table
        const propertiesData = await viewPropertiesPage.getPropertiesDataFromTable();

        // Verify for the first row that the energy rating is displayed as 'Unrated' when the property is not rated 
        const firstProperty = propertiesData[0];
        expect(firstProperty).toBeDefined();
        expect(firstProperty.energyRating).toBe('Unrated');
    });
});

test.describe('View Properties Page Navigation Tests', () => {
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

    test('Should navigate to Home page when clicking Home breadcrumb link', async () => {
        const homePage = await viewPropertiesPage.clickBreadcrumbHome();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Should navigate to Filter Properties page when clicking Filter Properties breadcrumb link', async () => {
        const filterPropertiesPage = await viewPropertiesPage.clickBreadcrumbFilterProperties();
        expect(await filterPropertiesPage.isDisplayed()).toBe(true);
    });

    test('Should navigate to the Filter Properties page when clicking on Property Records tab in the header', async () => {
        const filterPropertiesPage = await viewPropertiesPage.clickOnPropertyRecordsTab();
        expect(await filterPropertiesPage.isDisplayed()).toBe(true);
    });

    test('Should navigate to Home page when clicking page header link', async () => {
        const homePage = await viewPropertiesPage.clickPageHeaderLink();
        expect(await homePage.isDisplayed()).toBe(true);
    });
});

test.describe('View Properties export functionality', () => {
    let filterPropertiesPage: FilterPropertiesPage;
    
    // Helper function to convert ISO date to UI format
    const convertISODateToUIFormat = (isoDate: string): string => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };
    
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        filterPropertiesPage = await homePage.clickViewProperties();
    });

    test('Validate export count on the View Properties page', async ({ page }) => {       
        // Set Energy Rating filter to 'A'
        await filterPropertiesPage.setEnergyRatingFilter('A');
        
        // Set Council filter to 'LONDON BOROUGH OF BEXLEY'
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
        
        // Apply the filters
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();

        // Get the display count of records before export
        const propertiesCountField = await viewPropertiesPage.getPropertiesCountField();
        const displayedCountText = await propertiesCountField.innerText();
        const displayedCount = parseInt(displayedCountText.match(/(\d+)/)?.[1] || '0', 10);

        // Ensure we have records to export
        expect(displayedCount).toBeGreaterThan(0);
        
        // Export the filtered data
        const exportedRecords = await viewPropertiesPage.exportFilteredData();
        
        // Validate the exported data
        expect(exportedRecords.length).toEqual(displayedCount);
    });

    test('Exported data should match UI table data', async () => {
        // Set Energy Rating filter to 'A'
        await filterPropertiesPage.setEnergyRatingFilter('A');
        
        // Set Council filter to 'LONDON BOROUGH OF BEXLEY'
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
        
        // Apply the filters
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();

        // Get data from the table on the page
        const uiTableData: PropertyData[] = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(uiTableData.length).toBeGreaterThan(0);
        
        // Export filtered data
        const exportedData: Record<string, any>[] = await viewPropertiesPage.exportFilteredData();
        expect(exportedData.length).toBeGreaterThan(0);

        // For each UI record
        uiTableData.forEach(uiRecord => {
            // Find matching record in exported data based on property address displayed on the page
            const matchingExportRecord = exportedData.find(record => {
                const recordAddress = 
                    (record['FlatNameNumber'] ? `${record['FlatNameNumber']}, ` : '') +
                    (record['Number'] ? `${record['Number']}, ` : '') +
                    (record['Line1'] ? `${record['Line1']}, ` : '') +
                    (record['Line2'] ? `${record['Line2']}, ` : '') +
                    (record['Line3'] ? `${record['Line3']}, ` : '') +
                    (record['Town'] ? `${record['Town']}, ` : '') +
                    (record['Postcode'] ? `${record['Postcode']}` : '');
                return recordAddress === uiRecord.address;
            });
            expect(matchingExportRecord, `No matching exported record found for UI record with address: ${uiRecord.address}`).toBeDefined();

            // Verify Energy Rating matches between exported record and UI record
            //   Construct energy rating in the same format as in the UI for accurate comparison
            //   Example: "A (10)"
            const exportedEnergyRating = `${matchingExportRecord!['EPCEnergyRatingBand']} (${matchingExportRecord!['EPCEnergyRating']})`;
            expect(uiRecord?.energyRating, 
                `Energy rating mismatch for address '${uiRecord.address}': expected '${uiRecord?.energyRating}', got '${exportedEnergyRating}'`)
                .toBe(exportedEnergyRating);

            // Verify EPC Expiry Date matches between exported record and UI record
            const exportedEPCExpiryDate = convertISODateToUIFormat(matchingExportRecord!['EPCExpiryDate']);
            expect(uiRecord?.epcExpiryDate, 
                `EPC Expiry Date mismatch for address '${uiRecord.address}': expected '${uiRecord?.epcExpiryDate}', got '${exportedEPCExpiryDate}'`)
                .toBe(exportedEPCExpiryDate);

            // Verify PRS Exemptions matches between exported record and UI record
            expect(uiRecord?.PRSExemptions, 
                `The 'PRS Exemptions' mismatch for address '${uiRecord.address}': expected '${uiRecord?.PRSExemptions}', got '${matchingExportRecord!['exemptionStatus']}'`)
                .toBe(matchingExportRecord!['exemptionStatus']);
        });
    });
});