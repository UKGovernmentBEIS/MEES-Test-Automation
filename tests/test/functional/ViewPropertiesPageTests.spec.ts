import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ExportFieldMapping, PropertyData, ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { DMSExportApiClient } from '../../api/DMSExportApiClient';
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
            // TODO (Bug 908): 'PRS exemption' field displays the wrong value and background colour when no data
            'Not found': 'grey'
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

    test('Only required fields are exported', async ({ page }) => {
        // Set specific filter criteria to get one property owner/landlord filed set in the export
        const energyRatingFilter = 'A';
        const councilFilter = 'LONDON BOROUGH OF BEXLEY';
        const postcodeFilter = 'DA16 3QD';
        const fieldMappings: ExportFieldMapping[] = ViewPropertiesPage.EXPORT_FIELD_MAPPINGS;

        // Apply filters in the UI and export the CSV
        await filterPropertiesPage.setEnergyRatingFilter(energyRatingFilter);
        await filterPropertiesPage.setCouncilFilter(councilFilter);
        await filterPropertiesPage.setPostcodeFilter(postcodeFilter);
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();
        const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
        expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

        // Schema check — CSV must have exactly the columns defined in EXPORT_FIELD_MAPPINGS
        const exportColumnNames = Object.keys(exportedData[0]);
        const expectedColumns = fieldMappings.map(m => m.exportColumn);
        const missingColumns = expectedColumns.filter(c => !exportColumnNames.includes(c));
        const extraColumns   = exportColumnNames.filter(c => !expectedColumns.includes(c));
        expect(missingColumns, `Columns missing from export: ${missingColumns.join(', ')}`).toEqual([]);
        expect(extraColumns,   `Unexpected columns in export: ${extraColumns.join(', ')}`).toEqual([]);
    });

    test('Export field schema and data matches DMS API', async ({ request }) => {
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
        // BUG: 883 - Export values include invalid characters
        // Remove below regex once the issue is resolved and verify that UPRN values match exactly between DMS and export
        const matchInExport = exportedData.find(r => String(r['UPRN']).replace(/^=/, '') === String(dmsProperty['Uprn']));
        expect(matchInExport,
            `Cannot find UPRN '${dmsProperty['Uprn']}' for property with postcode '${dmsProperty['Postcode']}' from DMS not found in export.`
        ).toBeDefined();

        // Compare each mapped field value between DMS and export
        const valueMismatches: string[] = [];
        for (const { exportColumn, dmsField, dmsFields, dmsLandlordField, dmsLandlordFields, prseField, meesField, dmsEpcField, normalize } of fieldMappings) {
            const raw = (v: unknown) => (v === null || v === undefined || v === 'Data not found') ? '' : String(v);
            let rawDmsValue: unknown;
            if  (prseField || meesField ) {
                // If both prseField and meesField are defined, skip the comparison as these fields do not have DMS equivalents 
                // and are derived from multiple DMS fields.
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

    test.skip('Exported EPC Certificates (Link) field is valid and matches the property address', async ({ page }) => {
        // BUG 899: certificateLink has been moved from the epcCertificates array to the root property object as part of the fix.
        // The export has not yet been updated to read from the new location.
        // Update this test to read certificateLink from the 'Property' export column and remove the CertificateLink regex workaround once the export fix is deployed.
        test.skip(true, 'BUG 899 — export not yet updated to use certificateLink from root property object');

        // Apply filters in the UI and export the CSV
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();
        const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
        expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

        // Find a property with a non-empty 'EPC Certificates (Link)'
        // BUG 912: Column key uses camelCase 'EpcCertificates (Link)' — update to correct name when bug is fixed
        const propertyWithEpcLink = exportedData.find(r => r['EpcCertificates (Link)'] && r['EpcCertificates (Link)'].trim() !== '');
        expect(propertyWithEpcLink, 'No property with a non-empty EPC Certificates (Link) field was found in the export').toBeDefined();

        // Copy the URL from the export
        const rawValue = propertyWithEpcLink!['EpcCertificates (Link)']; // BUG 912: update key when column is renamed

        // BUG: 899 - The 'EPCCertificates (Link)' field shows invalid value
        // Extract CertificateLink value using regex as JSON.parse() cannot handle unquoted keys
        const urlMatch = rawValue.match(/CertificateLink:([^,}]+)/);
        const url = urlMatch ? urlMatch[1].trim() : rawValue;

        // Verify that the resulting string is a valid URL
        const isValidUrl = (str: string): boolean => {
            try {
                new URL(str);
                return true;
            } catch {
                return false;
            }
        };
        expect(isValidUrl(url), `The EPC Certificates (Link) value '${url}' is not a valid URL`).toBe(true);

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

    test('Exported EPC Certificates (Link) field is empty for properties without EPC data', async ({ page }) => {
        // Apply filters in the UI and export the CSV
        const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForPageToLoad();
        await viewPropertiesPage.waitForTableContent();
        const exportedData: Record<string, string>[] = await viewPropertiesPage.exportFilteredData();
        expect(exportedData.length, 'Export returned no records').toBeGreaterThan(0);

        // Find a property with 'EPC energy rating' = '0'
        // BUG 913 WORKAROUND: Column is currently named 'Current EPC energy rating' instead of 'EPC energy rating'.
        // Change key back to 'EPC energy rating' when bug 913 is fixed.
        const propertyWithoutEpcEnergyData = exportedData.find(r => r['Current EPC energy rating'] === '0');
        expect(propertyWithoutEpcEnergyData, 'No property with an EPC energy rating of "0" was found in the export').toBeDefined();

        // Verify that the 'EPC Certificates (Link)' field is empty for this property
        // BUG 912: Column key uses camelCase 'EpcCertificates (Link)' — update to correct name when bug is fixed
        const rawEpcLink = propertyWithoutEpcEnergyData!['EpcCertificates (Link)']?.trim() ?? '';
        // BUG 899 WORKAROUND: empty EPC links are exported as '[]' instead of ''
        // The assertion below will fail when BUG 899 is fixed — remove this workaround at that point
        expect(rawEpcLink, 'BUG 899 appears to be fixed — remove the [] workaround below').toBe('[]');
        const hasEpcLink = rawEpcLink !== '' && rawEpcLink !== '[]'; // '[]' treated as empty due to BUG 899
        expect(hasEpcLink, `Property with UPRN ${propertyWithoutEpcEnergyData!['UPRN']} has an 'EPC energy rating' of "0" but has an EPC link '${rawEpcLink}' in the export`).toBe(false);
    });
});