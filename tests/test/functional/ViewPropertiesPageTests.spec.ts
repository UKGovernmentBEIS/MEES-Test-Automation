import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ExportFieldMapping, PropertyData, ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { DMSExportApiClient, DMSRawItem } from '../../api/DMSExportApiClient';
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
        // Number of console errors is currently expected to be less than 8 due to known issue MEESALPHA-577.
        const viewPropertiesPageErrors = viewPropertiesPage.getAllConsoleErrors();
        await expect(viewPropertiesPageErrors.length, 
            'TODO: Console errors should be investigated and resolved. If they are expected, this assertion can be removed or updated accordingly.'
        ).toBeLessThan(8);

        // Verify page title
        await expect(page).toHaveTitle('View Property records');
    });

    test('Filter summary does not display Landlord location filter', async ({ page }) => {

        // Verify that 'Landlord location' does not appear as a filter row in the 'Filters applied' summary
        const landlordLocationFilterRow = await viewPropertiesPage.getFilterCriterionValueField('Landlord location');
        await expect(landlordLocationFilterRow).toHaveCount(0);
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

        // Set the council filter to 'LONDON BOROUGH OF BARNET' and verify that no records are found
        const filterPropertiesPage3 = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage3.waitForPageToLoad();
        await filterPropertiesPage3.setCouncilFilter('LONDON BOROUGH OF BARNET');
        viewPropertiesPage = await filterPropertiesPage3.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await expect(await viewPropertiesPage.getNoRecordsFoundMessage()).toBeVisible();
    });

    test('Selecting Evidence found returns only properties with Found rental evidence', async () => {
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.selectEvidenceFoundRentalEvidence();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        const properties = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(properties.length).toBeGreaterThan(0);
        for (const property of properties) {
            expect(property.rentalEvidence).toBe('Found');
        }
    });

    test('Selecting Not found returns only properties with Not found rental evidence', async () => {
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.selectNotFoundRentalEvidence();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        const properties = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(properties.length).toBeGreaterThan(0);
        for (const property of properties) {
            expect(property.rentalEvidence).toBe('Not found');
        }
    });

    test('Results table contains Rental evidence column with valid values', async ({ page }) => {
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        await expect(page.getByRole('columnheader', { name: 'Rental evidence' })).toBeVisible();

        const properties = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(properties.length).toBeGreaterThan(0);
        for (const property of properties) {
            expect(['Found', 'Not found']).toContain(property.rentalEvidence);
        }
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
        const propertiesData = await viewPropertiesPage.getAllPropertiesDataFromTable();
        expect(propertiesData.length, 'No properties found in the table').toBeGreaterThan(0);

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
            'Not found': ''
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

    test('PRS Exemption column shows \'Not found\' for a non-exempt property with a penalty', async ({ page }) => {
        // Navigate to the known property that has a penalty recorded in Salesforce but no PRS exemption.
        // This property is used as shared test data with PropertyDetailsPageTest.spec.ts.
        const filterPropertiesPage = await viewPropertiesPage.clickChangeFilters();
        await filterPropertiesPage.setEnergyRatingFilter('G');
        await filterPropertiesPage.setPostcodeFilter('DA1 4BH');
        viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();

        const propertiesData = await viewPropertiesPage.getPropertiesDataFromTable();
        expect(propertiesData.length, 'No properties found in the table for postcode DA1 4BH with energy rating G').toBeGreaterThan(0);

        // Find the specific property known to have a penalty but no exemption
        const targetAddress = '6, London Road, Crayford, DARTFORD, DA1 4BH';
        const targetProperty = propertiesData.find(p => p.address === targetAddress);
        expect(targetProperty, `Property with address '${targetAddress}' not found in the table`).toBeDefined();

        // Verify that penalty data does not bleed into the PRS Exemption column —
        // it must show 'Not found', not a penalty status value
        expect(targetProperty!.PRSExemptions,
            `Expected PRS Exemption column for '${targetAddress}' to be 'Not found' but got '${targetProperty!.PRSExemptions}'`
        ).toBe('Not found');
    });

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
                apiProperty.Name ? apiProperty.Name : '',
                apiProperty.Number ? apiProperty.Number : '',
                apiProperty.FlatNameNumber ? apiProperty.FlatNameNumber : '',
                apiProperty.Line1 ? apiProperty.Line1 : '',
                apiProperty.Line2 ? apiProperty.Line2 : '',
                apiProperty.Line3 ? apiProperty.Line3 : '',
                apiProperty.Town ? apiProperty.Town : '',
                apiProperty.County ? apiProperty.County : '',
                apiProperty.Postcode ? apiProperty.Postcode : ''
            ].filter(part => part.trim() !== '');
            const address = addressParts.join(', ').replace(/  +/g, ' '); // Replace multiple spaces with single space

            // Concatenate energy rating. For example: C(55) - EPCEnergyRatingBand(EPCEnergyRating)
            const energyRating = 
                `${apiProperty.EPCEnergyRatingBand}` === 'Unrated' 
                    ? 'Unrated' : `${apiProperty.EPCEnergyRatingBand} (${apiProperty.EPCEnergyRating})`;

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
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const day = String(date.getDate());
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

    test('Exported CSV filename follows the MEES_Properties_YYYY-MM-DDThh-mm-ss.csv pattern', async ({ page }) => {
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();

        const filename = await viewPropertiesPage.getExportFilename();

        // Expected pattern: MEES_Properties_YYYY-MM-DDThh-mm-ss.csv
        const filenamePattern = /^MEES_Properties_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/;
        expect(filename, `Export filename '${filename}' does not match expected pattern 'MEES_Properties_YYYY-MM-DDThh-mm-ss.csv'`).toMatch(filenamePattern);
    });

    test.describe('Export structure', () => {
        test('Exported data match filtered UI data', async ({ page }) => {       
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

        test('Only required fields are exported in the correct order', async ({ page }) => {
            // TC-2001
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const postcodeFilter = 'DA16 3QD';
            const fieldMappings: ExportFieldMapping[] = ViewPropertiesPage.EXPORT_FIELD_MAPPINGS;

            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            const exportColumnNames = Object.keys(exportedData[0]);
            const expectedColumns = fieldMappings.map(m => m.exportColumn);
            expect(exportColumnNames, 'Export column order does not match EXPORT_FIELD_MAPPINGS specification').toEqual(expectedColumns);
        });

        test('Export column names match specification', async ({ page }) => {
            // TC-2048
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const postcodeFilter = 'DA16 3QD';
            const fieldMappings: ExportFieldMapping[] = ViewPropertiesPage.EXPORT_FIELD_MAPPINGS;

            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            const exportColumnNames = Object.keys(exportedData[0]);
            const expectedColumns = fieldMappings.map(m => m.exportColumn);
            const missingColumns = expectedColumns.filter(c => !exportColumnNames.includes(c));
            const extraColumns   = exportColumnNames.filter(c => !expectedColumns.includes(c));
            expect(missingColumns, `Columns missing from export: ${missingColumns.join(', ')}`).toEqual([]);
            expect(extraColumns,   `Unexpected columns in export: ${extraColumns.join(', ')}`).toEqual([]);
        });

        test('Exported directly-mapped field values match DMS API', async ({ request }) => {
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const lacodes = ['E09000004'];
            const fieldMappings: ExportFieldMapping[] = ViewPropertiesPage.EXPORT_FIELD_MAPPINGS;

            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            //await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Fetch a reference property from DMS and locate it in the export by UPRN
            const dmsApiClient = new DMSExportApiClient(request);
            const rawDmsItem = await dmsApiClient.findFirstFullyPopulatedItem({ lacodes, energyratingband: energyRatingFilter});
            const dmsProperty = dmsApiClient.flattenItem(rawDmsItem);
            expect(dmsProperty['Uprn'], 'Reference DMS property has no UPRN').toBeDefined();
            const matchInExport = exportedData.find(r => String(r['UPRN']) === String(dmsProperty['Uprn']));
            expect(matchInExport,
                `Cannot find UPRN '${dmsProperty['Uprn']}' for property with postcode '${dmsProperty['Postcode']}' from DMS not found in export.`
            ).toBeDefined();

            // Compare each mapped field value between DMS and export
            const valueMismatches: string[] = [];
            for (const { exportColumn, dmsField, dmsFields, dmsLandlordField, dmsLandlordFields, dmsEpcField, dedicatedTest, normalize } of fieldMappings) {
                const raw = (v: unknown) => (v === null || v === undefined || v === 'Data not found') ? '' : String(v);
                let rawDmsValue: unknown;
                if  (dedicatedTest) {
                    // Skip fields dedicated tests
                    continue;
                } if (dmsFields) {
                    // Multi-field column — concatenate multiple DMS fields into a single string
                    rawDmsValue = dmsFields.map(f => dmsProperty[f] ?? '').filter(p => String(p).trim() !== '').join(', ');
                } else if (dmsLandlordFields) {
                    // Multi-field landlord column — concatenate multiple DMS landlord fields into a single string
                    rawDmsValue = dmsLandlordFields.map(f => dmsProperty[f] ?? '').filter(p => String(p).trim() !== '').join(' | ');
                } else {
                    // Single field — direct lookup from the flattened DMS property
                    rawDmsValue = dmsProperty[(dmsField ?? dmsLandlordField ?? dmsEpcField)!];
                }
                const dmsValue    = normalize ? normalize(raw(rawDmsValue)) : raw(rawDmsValue);
                const exportValue = normalize ? normalize(raw(matchInExport![exportColumn])) : raw(matchInExport![exportColumn]);
                if (dmsValue !== exportValue) {
                    valueMismatches.push(`${exportColumn}: DMS='${rawDmsValue}' vs Export='${matchInExport![exportColumn]}'`);
                }
            }
            expect(valueMismatches,
                `Field value mismatches for UPRN ${dmsProperty['Uprn']}: ${valueMismatches.join('; ')}`
            ).toEqual([]);
        });

        test('Exported PRS Exemption Status and Comments match Salesforce data', async ({ request }) => {
            // Property under this address has prepared data in Salesforce with:
            // - PRS Exemption Status, 
            // - PRS Exemption Date,
            // - Comments populated, 
            // so we can verify the export values against the source of truth in Salesforce
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const postcodeFilter = 'DA1 4AL';
            const address = 'Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL';

            // Apply filters and export data
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            await filterPropertiesPage.setPostcodeFilter(postcodeFilter);   
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            // - we are expecting just one property in the results, but let's assert that to be sure our test data is correct
            const countField = await viewPropertiesPage.getPropertiesCountField();
            const countText = await countField.textContent();
            const different = countText?.split(' ')[0];
            expect(countText, `Unexpected number of results. Expected 1 result, but found a ${different} number`).toBe('1 results');
            // - export the data and verify that we have records in the export
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Display the Property Details page for the property with the above filters
            const propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(address);
            await propertyDetailsPage.waitForPageToLoad();

            // Get the UPRN for the property to use as a reference when locating the same property in the export
            await propertyDetailsPage.SelectTab('Property details');
            const referencedProperty_UPRN = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'UPRN');

            // Get exported data for the property based on UPRN and verify that we can find the property in the export using UPRN as a unique identifier
            const matchInExport = exportedData.find(r => String(r['UPRN']).trim() === referencedProperty_UPRN.trim());
            expect(matchInExport, `Property with UPRN ${referencedProperty_UPRN} not found in the export`).toBeDefined();

            // Verify 'PRS exemption status'in the export match the value in the application for the same property
            await propertyDetailsPage.SelectTab('PRS exemptions and penalties');

            // Verify 'PRS exemption status' value in the export matches the value in the application,
            // using expect.poll() to retry until the page value stabilises and matches the export
            await expect.poll(
                () => propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status'),
                { message: `PRS Exemption Status mismatch for UPRN ${referencedProperty_UPRN}: export shows '${matchInExport!['PRS exemption status']}'` }
            ).toBe(matchInExport!['PRS exemption status']);

            // Verify 'Comments' in the export match the comments in the application for the same property
            const commentsLocator = await propertyDetailsPage.getComments();
            await commentsLocator.first().waitFor({ state: 'visible' });
            const referencedProperty_PRSExemptionComments: string[] = await commentsLocator.allInnerTexts();
            expect(referencedProperty_PRSExemptionComments.length, 'Reference property has no PRS Exemption Comments').toBeGreaterThan(0);
            
            // - normalise comments for comparison.
            // UI: allInnerTexts() on the comments list returns a mix of comment body lines,
            //     blank lines, and 'Added by ...' attribution lines — extract just the bodies.
            const uiCommentTexts = referencedProperty_PRSExemptionComments.join('\n').split('\n')
                .map(s => s.trim())
                .filter(s => s !== '' && !s.startsWith('Added by'));

            // - export: all comments joined as 'body by author on date | body by author on date | ...'
            // - extract just the comment body (everything before the last ' by ') from each entry.
            const exportCommentTexts = matchInExport!['Comments']
                .split(' | ')
                .map(entry => {
                    const byIdx = entry.lastIndexOf(' by ');
                    return (byIdx !== -1 ? entry.substring(0, byIdx) : entry).trim();
                })
                .filter(s => s !== '');

            // - compare all comments between UI and export
            expect(exportCommentTexts,
                `Comments mismatch for UPRN ${referencedProperty_UPRN}: ` +
                `UI has ${uiCommentTexts.length} comment(s), export has ${exportCommentTexts.length} comment(s). ` +
                `First UI: '${uiCommentTexts[0]}', First export: '${exportCommentTexts[0]}'`
            ).toEqual(uiCommentTexts);
        });

        test('Exported date field values use YYYY-MM-DD format', async ({ page }) => {
            // DA1 4AL returns a property with both an EPC expiry date and a PRS exemption date,
            // allowing both date columns to be validated in a single export.
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const postcodeFilter = 'DA1 4AL';

            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            const yyyyMmDd = /^\d{4}-\d{2}-\d{2}$/;

            // Validate EPC expiry date cell format
            const epcDateRows = exportedData.filter(r => r['EPC expiry date']?.trim() !== '');
            expect(epcDateRows.length, 'No rows with a populated EPC expiry date found — cannot validate format').toBeGreaterThan(0);
            const epcDateErrors = epcDateRows
                .filter(r => !yyyyMmDd.test(r['EPC expiry date'].trim()))
                .map(r => `UPRN ${r['UPRN']}: '${r['EPC expiry date']}'`);
            expect(epcDateErrors,
                `EPC expiry date values not in YYYY-MM-DD format: ${epcDateErrors.join('; ')}`
            ).toEqual([]);

            // Validate PRS exemption date cell format
            const prsDateRows = exportedData.filter(r => r['PRS exemption date']?.trim() !== '');
            expect(prsDateRows.length, 'No rows with a populated PRS exemption date found — cannot validate format').toBeGreaterThan(0);
            const prsDateErrors = prsDateRows
                .filter(r => !yyyyMmDd.test(r['PRS exemption date'].trim()))
                .map(r => `UPRN ${r['UPRN']}: '${r['PRS exemption date']}'`);
            expect(prsDateErrors,
                `PRS exemption date values not in YYYY-MM-DD format: ${prsDateErrors.join('; ')}`
            ).toEqual([]);
        });

        test.describe('Verify field values when source data is absent', () => {

            test('Property data fields show expected placeholder values when source data is absent', async () => {
                await filterPropertiesPage.setPostcodeFilter('DA1 4FY');
                const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
                await viewPropertiesPage.waitForPageToLoad();
                await viewPropertiesPage.waitForTableContent();
                const exportedDataNoUprn: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
                expect(exportedDataNoUprn.length, 'Export returned no records').toBeGreaterThan(0);

                // Find a row for a property that exists only via its EPC record (no UPRN).
                // All property-level fields sourced via UPRN linkage (VOA, DMS, Salesforce) should
                // display their respective 'not found' placeholders for such a row.
                const rowWithNoUprn = exportedDataNoUprn.find(r => r['UPRN'] === 'Not found');
                expect(rowWithNoUprn, 'No row with UPRN "Not found" found in export — test data gap').toBeDefined();

                // UPRN — confirmed 'Not found' when no UPRN (TC-2027)
                expect(rowWithNoUprn!['UPRN']).toBe('Not found');
                // Rateable value — sourced from VOA data via UPRN; absent when there is no UPRN
                expect(rowWithNoUprn!['Rateable value (GBP)']).toBe('Not found');
                // Possible rental evidence — both DMS booleans are false when no landlord/SIC link via UPRN
                expect(rowWithNoUprn!['Possible rental evidence from EPC register']).toBe('Not found');
                expect(rowWithNoUprn!['Possible rental evidence from Companies House']).toBe('Not found');
                // PRS exemption status — Salesforce record is keyed by UPRN; no UPRN = no record
                expect(rowWithNoUprn!['PRS exemption status']).toBe('Not found');
                // PRS exemption date — empty when there is no PRS exemption record
                expect(rowWithNoUprn!['PRS exemption date'].trim()).toBe('Not found');
            });

            test('EPC fields show correct values when property has no EPC certificate', async () => {
                await filterPropertiesPage.setEnergyRatingFilter('Unrated');
                const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
                await viewPropertiesPage.waitForPageToLoad();
                await viewPropertiesPage.waitForTableContent();
                const exportedDataUnrated: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
                expect(exportedDataUnrated.length, 'Export returned no records').toBeGreaterThan(0);

                // All rows in this export are Unrated — any row will have no EPC data.
                // Use the first row as the reference.
                const unratedRow = exportedDataUnrated[0];
                expect(unratedRow, 'Unrated export returned no records — test data gap').toBeDefined();

                // EPC energy rating, EPC expiry date and EPC certificate link show 'Not found' when there is no EPC data.
                expect(unratedRow!['EPC energy rating'].trim()).toBe('Not found');
                expect(unratedRow!['EPC expiry date'].trim()).toBe('Not found');
                expect(unratedRow!['EPC certificate link'].trim()).toBe('Not found');
                // EPC transaction type and EPC history remain empty when there is no EPC certificate.
                expect(unratedRow!['EPC transaction type'].trim()).toBe('Not found');
                expect(unratedRow!['EPC history (rating; expiry; transaction type)'].trim()).toBe('Not found');
            });
        });
    });

    test.describe('Export field values', () => {
        test('Property owner column sets in export equal the maximum landlord count', async ({ request }) => {
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const lacodes = ['E09000004'];

            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Determine maximum owner index N from CSV headers (Property owner N name)
            const exportHeaders = Object.keys(exportedData[0]);
            const ownerNameHeaderRegex = /^Property owner (\d+) name$/;
            const ownerIndexes = exportHeaders
                .map(h => h.match(ownerNameHeaderRegex))
                .filter((m): m is RegExpMatchArray => m !== null)
                .map(m => parseInt(m[1], 10));
            const maxOwnerIndexFromExport = ownerIndexes.length > 0 ? Math.max(...ownerIndexes) : 0;

            // Determine maximum landlord count from DMS for the same filters
            const dmsApiClient = new DMSExportApiClient(request);
            const rawDmsItems = await dmsApiClient.getExportedData({ lacodes, energyratingband: energyRatingFilter });
            expect(rawDmsItems.length, 'DMS export returned no items').toBeGreaterThan(0);
            const maxLandlordCountFromDms = rawDmsItems.reduce((max, item) => {
                const landlordCount = Array.isArray(item.Landlords) ? item.Landlords.length : 0;
                return Math.max(max, landlordCount);
            }, 0);

            expect(maxOwnerIndexFromExport,
                `Maximum owner index in export (${maxOwnerIndexFromExport}) does not match maximum landlord count in DMS (${maxLandlordCountFromDms})`
            ).toBe(maxLandlordCountFromDms);

            // Validate all owner column groups exist for indexes 1..N with no gaps
            const missingOwnerColumns: string[] = [];
            for (let i = 1; i <= maxOwnerIndexFromExport; i++) {
                const requiredColumns = [
                    `Property owner ${i} name`,
                    `Property owner ${i} location`,
                    `Property owner ${i} address`,
                    `Property owner ${i} SIC code(s)`
                ];
                requiredColumns.forEach(column => {
                    if (!exportHeaders.includes(column)) {
                        missingOwnerColumns.push(column);
                    }
                });
            }
            expect(missingOwnerColumns,
                `Missing owner columns for indexes 1..${maxOwnerIndexFromExport}: ${missingOwnerColumns.join(', ')}`
            ).toEqual([]);

            // Ensure there are no extra owner columns above N
            const ownerColumnRegex = /^Property owner (\d+) (name|location|address|SIC code\(s\))$/;
            const extraOwnerColumns = exportHeaders.filter(header => {
                const match = header.match(ownerColumnRegex);
                if (!match) return false;
                return parseInt(match[1], 10) > maxOwnerIndexFromExport;
            });
            expect(extraOwnerColumns,
                `Unexpected owner columns above max index ${maxOwnerIndexFromExport}: ${extraOwnerColumns.join(', ')}`
            ).toEqual([]);
        });

        test('Exported EPC certificate link field is valid and matches the property address', async ({ page }) => {
            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter('A');
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Find a property with a non-empty 'EPC certificate link'
            const propertyWithEpcLink = exportedData.find(r => r['EPC certificate link'] && r['EPC certificate link'].trim() !== '');
            expect(propertyWithEpcLink, 'No property with a non-empty EPC certificate link field was found in the export').toBeDefined();

            // Copy the URL from the export
            const url = propertyWithEpcLink!['EPC certificate link']!.trim();

            // Verify that the resulting string is a valid URL
            const isValidUrl = (str: string): boolean => {
                try {
                    new URL(str);
                    return true;
                } catch {
                    return false;
                }
            };
            expect(isValidUrl(url), `The EPC certificate link value '${url}' is not a valid URL`).toBe(true);

            // Load the URL and Verify that the address displayed on the EPC certificate page matches the address of the property in the export
            await page.goto(url);
            const certificateAddressLocator = page.locator('p.epc-address.govuk-body');
            await expect(certificateAddressLocator).toBeVisible();
            // The address parts are separated by <br> tags which produce no separator in textContent(),
            // so use innerHTML and replace <br> with ', ' before stripping remaining tags
            const certificateAddressHtml = await certificateAddressLocator.innerHTML();
            const certificateAddress = certificateAddressHtml
                .replace(/<br\s*\/?>/gi, ', ')
                .replace(/<[^>]+>/g, '')
                .trim();
            const expectedAddress = propertyWithEpcLink!['Property address'];
            expect(certificateAddress, `The address on the EPC certificate page '${certificateAddress}' does not match the expected address '${expectedAddress}' from the export`).toBe(expectedAddress);
        });

        test('Exported EPC certificate link field shows \'Not found\' for properties without EPC data', async ({ page }) => {
            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter('Unrated');
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Find a property with 'EPC energy rating' = 'Not found' (no EPC data).
            const propertyWithoutEpcEnergyData = exportedData.find(r => r['EPC energy rating'] === 'Not found');
            expect(propertyWithoutEpcEnergyData, 'No property with an EPC energy rating of "Not found" was found in the export').toBeDefined();

            // Verify that the 'EPC certificate link' field shows 'Not found' for this property
            const rawEpcLink = propertyWithoutEpcEnergyData!['EPC certificate link']?.trim() ?? '';
            expect(rawEpcLink, 
                `Property with UPRN ${propertyWithoutEpcEnergyData!['UPRN']} has 
                an 'EPC energy rating' of 'Not found' but 'EPC certificate link' is '${rawEpcLink}' 
                instead of 'Not found'`).toBe('Not found');
        });

        test('Exported \'Property owner 1 SIC code(s)\' field value format is correct', async ({ request }) => {
            // TC-2016
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const lacodes = ['E09000004'];

            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Fetch raw DMS items for the same filters
            const dmsApiClient = new DMSExportApiClient(request);
            const rawDmsItems = await dmsApiClient.getExportedData({ lacodes, energyratingband: energyRatingFilter });
            expect(rawDmsItems.length, 'DMS export returned no items').toBeGreaterThan(0);

            // Build UPRN → export row lookup
            const exportRowByUprn = new Map<string, Record<string, string>>();
            for (const row of exportedData) {
                exportRowByUprn.set(String(row['UPRN']).trim(), row);
            }

            // Case 1: first landlord has at least two non-null SIC codes → expect pipe-separated values in export
            const dmsItemWithMultiSic = rawDmsItems.find(item =>
                Array.isArray(item.Landlords) &&
                item.Landlords.length > 0 &&
                item.Landlords[0]['SicCodeSicText1'] != null &&
                item.Landlords[0]['SicCodeSicText2'] != null
            );
            expect(dmsItemWithMultiSic,
                'Test data gap: no DMS item with two or more SIC codes on the first landlord — cannot verify pipe-separated format'
            ).toBeDefined();

            // Case 2: first landlord exists but all SIC code fields are null → expect 'No data' in export
            const dmsItemWithNoSic = rawDmsItems.find(item =>
                Array.isArray(item.Landlords) &&
                item.Landlords.length > 0 &&
                item.Landlords[0]['SicCodeSicText1'] == null
            );
            expect(dmsItemWithNoSic,
                'Test data gap: no DMS item where the first landlord has no SIC codes — cannot verify "No data" value'
            ).toBeDefined();

            // Case 3: no landlords at all → expect 'No data' in export
            const dmsItemWithNoLandlord = rawDmsItems.find(item =>
                !Array.isArray(item.Landlords) || item.Landlords.length === 0
            );
            expect(dmsItemWithNoLandlord,
                'Test data gap: no DMS item with no landlord data — cannot verify empty field'
            ).toBeDefined();

            // Verify Case 1: field contains pipe-separated SIC codes and each part is non-empty
            const multiSicExportRow = exportRowByUprn.get(String(dmsItemWithMultiSic!.property.Uprn));
            expect(multiSicExportRow, `UPRN ${dmsItemWithMultiSic!.property.Uprn} not found in export`).toBeDefined();
            const multiSicValue = multiSicExportRow!['Property owner 1 SIC code(s)'];
            expect(multiSicValue,
                `UPRN ${dmsItemWithMultiSic!.property.Uprn}: expected pipe-separated SIC codes, got '${multiSicValue}'`
            ).toContain(' | ');
            multiSicValue.split(' | ').forEach(part => {
                expect(part.trim(),
                    `UPRN ${dmsItemWithMultiSic!.property.Uprn}: empty SIC code part in '${multiSicValue}'`
                ).not.toBe('');
            });

            // Verify Case 2: field shows 'No data' when the landlord has no SIC codes
            const noSicExportRow = exportRowByUprn.get(String(dmsItemWithNoSic!.property.Uprn));
            expect(noSicExportRow, `UPRN ${dmsItemWithNoSic!.property.Uprn} not found in export`).toBeDefined();
            expect(noSicExportRow!['Property owner 1 SIC code(s)'].trim(),
                `UPRN ${dmsItemWithNoSic!.property.Uprn}: expected 'Not found' for landlord with no SIC codes, got '${noSicExportRow!['Property owner 1 SIC code(s)']}'`
            ).toBe('Not found');

            // Verify Case 3: field shows 'Not found' when the property has no landlord data at all
            const noLandlordExportRow = exportRowByUprn.get(String(dmsItemWithNoLandlord!.property.Uprn));
            expect(noLandlordExportRow, `UPRN ${dmsItemWithNoLandlord!.property.Uprn} not found in export`).toBeDefined();
            expect(noLandlordExportRow!['Property owner 1 SIC code(s)'].trim(),
                `UPRN ${dmsItemWithNoLandlord!.property.Uprn}: expected 'Not found' when no owner data, got '${noLandlordExportRow!['Property owner 1 SIC code(s)']}'`
            ).toBe('Not found');
        });

        test('Exported Possible rental evidence field value is correct', async ({ request }) => {
            const lacodes = ["E09000004"];
            const energyRatingFilter = 'A';

            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Fetch raw DMS items so we can cross-reference each row's expected value
            const dmsApiClient = new DMSExportApiClient(request);
            const rawDmsItems = await dmsApiClient.getExportedData({ lacodes, energyratingband: energyRatingFilter });
            expect(rawDmsItems.length, 'DMS export returned no items').toBeGreaterThan(0);

            // --- 'Possible rental evidence from EPC register' ---
            // Case 1: PossibleEvidenceEpcTransactionType = true → 'Mandatory issue (Property to let) EPC transaction type'
            const uprnEpcTrue = rawDmsItems.find(item =>
                item.property.PossibleEvidenceEpcTransactionType === true
            )?.property.Uprn;
            expect(uprnEpcTrue,
                'Test data gap: no DMS item with PossibleEvidenceEpcTransactionType = true')
                .toBeDefined();
            const exportRowEpcTrue = exportedData.find(r => String(r['UPRN']) === String(uprnEpcTrue));
            expect(exportRowEpcTrue, `UPRN ${uprnEpcTrue} not found in export`).toBeDefined();
            expect(exportRowEpcTrue!['Possible rental evidence from EPC register'],
                `UPRN ${uprnEpcTrue}: expected 'Mandatory issue (Property to let) EPC transaction type' when PossibleEvidenceEpcTransactionType is true, got '${exportRowEpcTrue!['Possible rental evidence from EPC register']}'`
            ).toBe('Mandatory issue (Property to let) EPC transaction type');

            // Case 2: PossibleEvidenceEpcTransactionType = false → 'Not found'
            const uprnEpcFalse = rawDmsItems.find(item =>
                item.property.PossibleEvidenceEpcTransactionType !== true
            )?.property.Uprn;
            expect(uprnEpcFalse,
                'Test data gap: no DMS item with PossibleEvidenceEpcTransactionType = false')
                .toBeDefined();
            const exportRowEpcFalse = exportedData.find(r => String(r['UPRN']) === String(uprnEpcFalse));
            expect(exportRowEpcFalse, `UPRN ${uprnEpcFalse} not found in export`).toBeDefined();
            expect(exportRowEpcFalse!['Possible rental evidence from EPC register'],
                `UPRN ${uprnEpcFalse}: expected 'Not found' when PossibleEvidenceEpcTransactionType is false, got '${exportRowEpcFalse!['Possible rental evidence from EPC register']}'`
            ).toBe('Not found');

            // --- 'Possible rental evidence from Companies House' ---
            // Case 3: PossibleEvidenceSiccode = true → 'Property owner has letting company Standard Industrial Classification code'
            const uprnSiccodeTrue = rawDmsItems.find(item =>
                item.property.PossibleEvidenceSiccode === true
            )?.property.Uprn;
            expect(uprnSiccodeTrue,
                'Test data gap: no DMS item with PossibleEvidenceSiccode = true')
                .toBeDefined();
            const exportRowSiccodeTrue = exportedData.find(r => String(r['UPRN']) === String(uprnSiccodeTrue));
            expect(exportRowSiccodeTrue, `UPRN ${uprnSiccodeTrue} not found in export`).toBeDefined();
            expect(exportRowSiccodeTrue!['Possible rental evidence from Companies House'],
                `UPRN ${uprnSiccodeTrue}: expected 'Property owner has letting company Standard Industrial Classification code' when PossibleEvidenceSiccode is true, got '${exportRowSiccodeTrue!['Possible rental evidence from Companies House']}'`
            ).toBe('Property owner has letting company Standard Industrial Classification code');

            // Case 4: PossibleEvidenceSiccode = false → 'Not found'
            const uprnSiccodeFalse = rawDmsItems.find(item =>
                item.property.PossibleEvidenceSiccode !== true
            )?.property.Uprn;
            expect(uprnSiccodeFalse,
                'Test data gap: no DMS item with PossibleEvidenceSiccode = false')
                .toBeDefined();
            const exportRowSiccodeFalse = exportedData.find(r => String(r['UPRN']) === String(uprnSiccodeFalse));
            expect(exportRowSiccodeFalse, `UPRN ${uprnSiccodeFalse} not found in export`).toBeDefined();
            expect(exportRowSiccodeFalse!['Possible rental evidence from Companies House'],
                `UPRN ${uprnSiccodeFalse}: expected 'Not found' when PossibleEvidenceSiccode is false, got '${exportRowSiccodeFalse!['Possible rental evidence from Companies House']}'`
            ).toBe('Not found');
        });

        test('Exported EPC history field value is correct', async ({ request }) => {
            const energyRatingFilter = 'A';
            const councilFilter = 'LONDON BOROUGH OF BEXLEY';
            const lacodes = ['E09000004'];

            // Fetch raw DMS items and find one property with multiple EPC certificates
            const dmsApiClient = new DMSExportApiClient(request);
            const rawDmsItems = await dmsApiClient.getExportedData({ lacodes, energyratingband: energyRatingFilter });
            expect(rawDmsItems.length, 'DMS export returned no items').toBeGreaterThan(0);

            const dmsPropertyWithMultiEPCCertificates = rawDmsItems.find(item =>
                Array.isArray(item.EpcCertificates) && item.EpcCertificates.length > 1
            );
            expect(dmsPropertyWithMultiEPCCertificates, 'Test data gap: no DMS item with multiple EPC certificates — cannot verify the join behaviour').toBeDefined();

            // Apply filters in the UI and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
            await filterPropertiesPage.setCouncilFilter(councilFilter);
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            // Locate the reference property in the export by UPRN
            const uprnDMSPropertyWithMultiEPCCertificates = String(dmsPropertyWithMultiEPCCertificates!.property.Uprn);
            const propertyMatchInExport = exportedData.find(r => String(r['UPRN']) === uprnDMSPropertyWithMultiEPCCertificates);
            expect(propertyMatchInExport, `Cannot find UPRN '${uprnDMSPropertyWithMultiEPCCertificates}' in the export`).toBeDefined();

            // Derive expected value from all EPC certificates for the reference property
            // Each certificate entry is formatted as 'AssetRatingBand (AssetRating); ExpiryDate; TransactionType'
            // with entries joined by ' | '.
            const expectedValue = dmsPropertyWithMultiEPCCertificates!.EpcCertificates!
                .map(epc => `${epc.AssetRatingBand} (${epc.AssetRating}); ${epc.ExpiryDate.split('T')[0]}; ${epc.TransactionType}`)
                .join(' | ');
            const actualValue = propertyMatchInExport!['EPC history (rating; expiry; transaction type)'];

            expect(actualValue,
                `UPRN ${uprnDMSPropertyWithMultiEPCCertificates}: expected '${expectedValue}' (${dmsPropertyWithMultiEPCCertificates!.EpcCertificates!.length} EPC certificate(s)), got '${actualValue}'`
            ).toBe(expectedValue);
        });

        test('Exported data does not contain Landlord location column', async ({ page }) => {
            // Apply filters and export the CSV
            await filterPropertiesPage.setEnergyRatingFilter('A');
            await filterPropertiesPage.setCouncilFilter('LONDON BOROUGH OF BEXLEY');
            const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();
            await viewPropertiesPage.waitForTableContent();
            const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
            expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

            const exportColumnNames = Object.keys(exportedData[0]);
            expect(exportColumnNames, "'Landlord location' column should not be present in the export").not.toContain('Landlord location');
        });

        test('Export button is not displayed when there are no records', async ({ page }) => {
            // TC-2050
            // Apply a filter that returns no results
            const filterPropertiesPage2 = await filterPropertiesPage.clickApplyFilters();
            await filterPropertiesPage2.waitForPageToLoad();
            const filterPropertiesPageAgain = await filterPropertiesPage2.clickChangeFilters();
            await filterPropertiesPageAgain.setTownFilter('NonExistentTown');
            const viewPropertiesPage = await filterPropertiesPageAgain.clickApplyFilters();
            await viewPropertiesPage.waitForPageToLoad();

            // Verify no records message is shown
            await expect(await viewPropertiesPage.getNoRecordsFoundMessage()).toBeVisible();

            // Verify the export button is not visible
            await expect(viewPropertiesPage.getExportButton()).not.toBeVisible();
        });
    });
});