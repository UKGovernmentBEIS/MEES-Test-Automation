import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PropertyDetailsPage, DMSPropertyDetails } from '../../pages/Compliance/PropertyDetailsPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { getCurrentUserAccountName } from '../../utils/AuthUtils';
import { DMSExportApiClient } from '../../api/DMSExportApiClient';

function getExpectedCommentAnnotationUserIdentifier(page: any): string {
    const currentUserName = getCurrentUserAccountName(page);
    const normalizedUserName = currentUserName.trim().toLowerCase();

    // BUG 941 WORKAROUND: UI currently annotates comments with user email instead of user full name.
    // Keep this hardcoded mapping until bug 941 is fixed, then switch back to account display name.
    if (normalizedUserName === 'test user2') {
        return 'testusertriad123+002@gmail.com';
    }

    if (normalizedUserName === 'test user1' || normalizedUserName === 'test user') {
        return 'testusertriad123+001@gmail.com';
    }

    return currentUserName;
}

test.describe('View Properties Page Data Validation Tests', () => {
    let propertyDetailsPage: PropertyDetailsPage;
    let dmsPropertyDetails: DMSPropertyDetails;
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

    test.describe('Property Details Tab Data Validation', () => {

        test.beforeEach(async ({ page }, testInfo) => {
            await filterPropertiesPage.setEnergyRatingFilter('A');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
        });

        test('Verify data displayed in the Property details tab for property with UPRN', async ({ request }) => {
            // Helper function to construct address from DMS data
            const constructAddress = (property: any) => {
                const addressParts = [
                    property.line1,
                    property.line2,
                    property.line3,
                    property.town,
                    property.postcode
                ].filter(part => part !== null && part !== '').join('\n');
                return addressParts;
            };

            // Helper function to format currency
            const formatCurrency = (value: number) => {
                return new Intl.NumberFormat('en-GB', { 
                    style: 'currency', 
                    currency: 'GBP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
            };

            // Select the Property details tab before verifying any details to ensure all data is loaded
            await propertyDetailsPage.SelectTab('Property details');
            
            // Get DMS property details for comparison
            dmsPropertyDetails = await propertyDetailsPage.GetDMSPropertyDetailsValues(request, '100022918361');

            // Verify Address
            const expectedAddress = constructAddress(dmsPropertyDetails.property);
            expect(await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName(
                'Property details', 'Property address')).toBe(expectedAddress);

            // Verify UPRN
            expect(await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'UPRN')).toBe(dmsPropertyDetails.property.uprn.toString());

            // Verify Property Type
            expect(await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'Property type')).toBe(dmsPropertyDetails.property.epcPropertyType);

            // Verify Rateable Value
            const expectedRateableValue = formatCurrency(dmsPropertyDetails.property.rateableValue!);
            expect(await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'Rateable value')).toBe(expectedRateableValue);

            // Verify Possible Rental Evidence
            const expectedPossibleRentalEvidence = propertyDetailsPage.GetPossibleRentalEvidenceFromDMSPropertyDetails(dmsPropertyDetails);
            expect(await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'Possible rental evidence')).toBe(expectedPossibleRentalEvidence);
        });

        test('Verify all possible values for the Possible rental evidence field in the Property details tab', async ( {page} ) => {
            
        // All combinations of possible evidence values based on DMS data
            interface PossibleEvidenceTestCase {
                possibleEvidenceEpcTransactionType: boolean;
                possibleEvidenceSiccode: boolean;
                expectedPossibleRentalEvidence: string;
            }

            const testCases: PossibleEvidenceTestCase[] = [
                // Bug: 1031 'Invalid PossibleEvidenceEpcTransactionType for a property with multiple EPC Certificates'
                // { possibleEvidenceEpcTransactionType: true, possibleEvidenceSiccode: true, expectedPossibleRentalEvidence: 'Mandatory issue (Property to let) EPC transaction type\nProperty owner has letting company SIC code' },
                { possibleEvidenceEpcTransactionType: true, possibleEvidenceSiccode: true, expectedPossibleRentalEvidence: 'Mandatory issue (Property to let) EPC transaction type' },
                { possibleEvidenceEpcTransactionType: true, possibleEvidenceSiccode: false, expectedPossibleRentalEvidence: 'Mandatory issue (Property to let) EPC transaction type' },
                { possibleEvidenceEpcTransactionType: false, possibleEvidenceSiccode: true, expectedPossibleRentalEvidence: 'Property owner has letting company SIC code' },
                { possibleEvidenceEpcTransactionType: false, possibleEvidenceSiccode: false, expectedPossibleRentalEvidence: 'Not found' },
            ];

            const uprnForPropertyWithoutPossibleEvidence = '100022917839';
            const uprnForPropertyWithBothPossibleEvidence = '10023302621';
            const uprnForPropertyWithOnlyEpcEvidence = '100022918419';
            const uprnForPropertyWithOnlySiccodeEvidence = '10011861801';

            interface ErrorResults {
                possibleEvidenceEpcTransactionType: boolean;
                possibleEvidenceSiccode: boolean;
                errorMessage: string;
            }

            const errorResults: ErrorResults[] = [];
        
            // Enhance Property Details page URL to navigate directly to the property details page for each test case based on UPRN
            for (const testCase of testCases) {
                let uprn: string;
                if (testCase.possibleEvidenceEpcTransactionType && testCase.possibleEvidenceSiccode) {
                    uprn = uprnForPropertyWithBothPossibleEvidence;
                } else if (testCase.possibleEvidenceEpcTransactionType && !testCase.possibleEvidenceSiccode) {
                    uprn = uprnForPropertyWithOnlyEpcEvidence;
                } else if (!testCase.possibleEvidenceEpcTransactionType && testCase.possibleEvidenceSiccode) {
                    uprn = uprnForPropertyWithOnlySiccodeEvidence;
                } else {
                    uprn = uprnForPropertyWithoutPossibleEvidence;
                }

                await page.goto(`/compliance/view-details?buildingrefnum=${uprn}`);
                const actualPossibleEvidence = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Property details', 'Possible rental evidence');
                if (actualPossibleEvidence !== testCase.expectedPossibleRentalEvidence) {
                    errorResults.push({
                        possibleEvidenceEpcTransactionType: testCase.possibleEvidenceEpcTransactionType,
                        possibleEvidenceSiccode: testCase.possibleEvidenceSiccode,
                        errorMessage: `Actual Possible Rental Evidence: '${actualPossibleEvidence}' and expected: '${testCase.expectedPossibleRentalEvidence}'.`
                    });
                }
            }

            // If there are any mismatches, fail the test with details of all mismatches
            if (errorResults.length > 0) {
                let errorMessage = 'Mismatch in Possible rental evidence for the following test cases:\n';
                for (const result of errorResults) {
                    errorMessage += `EPC Transaction Type: ${result.possibleEvidenceEpcTransactionType}, 
                        SIC code: ${result.possibleEvidenceSiccode}, 
                        ${result.errorMessage}\n`;
                }
                expect(errorResults.length, errorMessage).toBe(0);
            }
        });
    });

    test.describe('Property Owner(s) Tab Data Validation', () => {

        test('Verify that all landlords associated with the property are displayed in the Property owner(s) tab', async ({ request }) => {
            // Get a property with multiple landlords from DMS 
            // to ensure the Property owner(s) tab is populated for the test
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithMultipleLandlords = 
                await dmsApiClient.getPropertyWithMultipleLandlords({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });
            
            // Extract the property address to search for the property in the UI 
            // and navigate to the Property Details page
            const dmsPropertyStreet = propertyWithMultipleLandlords.property.Line1;
            if (dmsPropertyStreet === null || dmsPropertyStreet === undefined || dmsPropertyStreet === '') {
                throw new Error('Property Line1 is empty — no suitable property found with multiple landlords');
            }

            // Extract postcode to use in filter
            // to reduce number of properties returned in the search results
            const dmsPropertyPostcode = propertyWithMultipleLandlords.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with multiple landlords');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithMultipleLandlords.property.Name,
                propertyWithMultipleLandlords.property.Number,
                propertyWithMultipleLandlords.property.FlatNameNumber,
                propertyWithMultipleLandlords.property.Line1,
                propertyWithMultipleLandlords.property.Line2,
                propertyWithMultipleLandlords.property.Line3,
                propertyWithMultipleLandlords.property.Town,
                propertyWithMultipleLandlords.property.County,
                propertyWithMultipleLandlords.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with multiple landlords
            await filterPropertiesPage.setStreetFilter(dmsPropertyStreet);
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Property owner(s)');
            
            // Verify number of owners displayed matches number of landlords in DMS
            const propertyOwnersCount = await propertyDetailsPage.getNumberOfPropertyOwners();
            expect(propertyOwnersCount).toBe(propertyWithMultipleLandlords.Landlords.length);

            // Read every owner shown in the UI into a list, so each owner can be matched to its
            // DMS landlord by company name rather than by position. The order owners appear in is
            // not significant — only that every DMS landlord's full record is displayed correctly.
            const uiOwners: { name: string; location: string; address: string; sicCode: string }[] = [];
            for (let i = 0; i < propertyOwnersCount; i++) {
                uiOwners.push({
                    name: await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'Name'),
                    location: await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'Location'),
                    address: await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'Address'),
                    sicCode: await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'SIC code(s)')
                });
            }

            // Verify each DMS landlord's full record (location, address, SIC codes) is displayed
            // correctly, matching by company name so a difference in ordering does not matter
            for (const dmsLandlord of propertyWithMultipleLandlords.Landlords) {
                const dmsName = dmsLandlord.CompanyName;
                const dmsSicCodeRaw = [
                    dmsLandlord.SicCodeSicText1,
                    dmsLandlord.SicCodeSicText2,
                    dmsLandlord.SicCodeSicText3,
                    dmsLandlord.SicCodeSicText4
                ].filter(code => code !== null && code !== undefined && code !== '').join(' | ');
                const dmsSicCode = dmsSicCodeRaw === '' ? 'Not found' : dmsSicCodeRaw;

                const uiOwner = uiOwners.find(owner => owner.name === dmsName);
                expect(uiOwner, `No property owner found in the UI matching DMS landlord "${dmsName}"`).toBeDefined();
                expect(uiOwner!.location, `Mismatch in Location for landlord "${dmsName}"`).toBe(dmsLandlord.Location);
                expect(uiOwner!.address, `Mismatch in Address for landlord "${dmsName}"`).toBe(dmsLandlord.Address);
                expect(uiOwner!.sicCode, `Mismatch in SIC code for landlord "${dmsName}"`).toBe(dmsSicCode);
            }
        });

        test('Verify that the Property owner(s) tab shows "Not found" for each field when there is no landlord information available for the property in DMS', async ({ request }) => {
            // Get a property with no landlord information from DMS 
            // to ensure the Property owner(s) tab is populated for the test
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithNoLandlordInfo = 
                await dmsApiClient.getPropertyWithNoLandlords({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });
            
            // Extract the property address to search for the property in the UI
            const dmsPropertyStreet = propertyWithNoLandlordInfo.property.Line1;
            if (dmsPropertyStreet === null || dmsPropertyStreet === undefined || dmsPropertyStreet === '') {
                throw new Error('Property Line1 is empty — no suitable property found with no landlord information');
            }

            // Extract postcode to use in filter to reduce number of properties
            //  returned in the search results
            const dmsPropertyPostcode = propertyWithNoLandlordInfo.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with no landlord information');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithNoLandlordInfo.property.Name,
                propertyWithNoLandlordInfo.property.Number,
                propertyWithNoLandlordInfo.property.FlatNameNumber,
                propertyWithNoLandlordInfo.property.Line1,
                propertyWithNoLandlordInfo.property.Line2,
                propertyWithNoLandlordInfo.property.Line3,
                propertyWithNoLandlordInfo.property.Town,
                propertyWithNoLandlordInfo.property.County,
                propertyWithNoLandlordInfo.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with no landlord information
            await filterPropertiesPage.setStreetFilter(dmsPropertyStreet);
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Property owner(s)');
            
            // Verify that "Not found" is displayed for each field in the Property owner(s) tab
            expect(await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(0, 'Name')).toBe(' Not found');
            expect(await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(0, 'Location')).toBe(' Not found');
            expect(await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(0, 'Address')).toBe(' Not found');
            expect(await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(0, 'SIC code(s)')).toBe(' Not found');
        });

        test('Verify that the Property owner(s) tab shows more than 4 landlords', async ({ request }) => {
            // Get a property with more than 4 landlords
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithMultipleLandlords = 
                await dmsApiClient.getPropertyWithMoreThanFourLandlords({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });

            expect(propertyWithMultipleLandlords.Landlords.length).toBeGreaterThan(4);

            // Extract postcode to use in filter to reduce number of properties
            //  returned in the search results
            const dmsPropertyPostcode = propertyWithMultipleLandlords.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with more than 4 landlords');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithMultipleLandlords.property.Name,
                propertyWithMultipleLandlords.property.Number,
                propertyWithMultipleLandlords.property.FlatNameNumber,
                propertyWithMultipleLandlords.property.Line1,
                propertyWithMultipleLandlords.property.Line2,
                propertyWithMultipleLandlords.property.Line3,
                propertyWithMultipleLandlords.property.Town,
                propertyWithMultipleLandlords.property.County,
                propertyWithMultipleLandlords.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with more than 4 landlords
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Property owner(s)');

            // Verify number of owners displayed matches number of landlords in DMS
            const propertyOwnersCount = await propertyDetailsPage.getNumberOfPropertyOwners();
            expect(propertyOwnersCount).toBe(propertyWithMultipleLandlords.Landlords.length);
        });

        test('Sic code field should display multiple sic codes on separate lines', async ({ request }) => {
            // Get a property with multiple landlords and sic codes
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithMultipleLandlords = 
                await dmsApiClient.getPropertyWithAnOwnerWithMultipleSicCodes({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });

            // Extract postcode to use in filter to reduce number of properties
            //  returned in the search results
            const dmsPropertyPostcode = propertyWithMultipleLandlords.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with an owner with multiple SIC codes');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithMultipleLandlords.property.Name,
                propertyWithMultipleLandlords.property.Number,
                propertyWithMultipleLandlords.property.FlatNameNumber,
                propertyWithMultipleLandlords.property.Line1,
                propertyWithMultipleLandlords.property.Line2,
                propertyWithMultipleLandlords.property.Line3,
                propertyWithMultipleLandlords.property.Town,
                propertyWithMultipleLandlords.property.County,
                propertyWithMultipleLandlords.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with an owner with multiple SIC codes
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Property owner(s)');

            // This property has one owner with multiple SIC codes. Find that owner in the DMS data
            // (rather than assuming it is the first landlord), then match it to the UI owner by
            // company name so a difference in ordering does not matter.
            const dmsOwnerWithMultipleSic = propertyWithMultipleLandlords.Landlords.find(landlord =>
                [landlord.SicCodeSicText1, landlord.SicCodeSicText2, landlord.SicCodeSicText3, landlord.SicCodeSicText4]
                    .filter(code => code !== null && code !== undefined && code !== '').length > 1
            );
            expect(dmsOwnerWithMultipleSic, 'No DMS landlord with multiple SIC codes found for this property').toBeDefined();

            const dmsSicCodes = [
                dmsOwnerWithMultipleSic!.SicCodeSicText1,
                dmsOwnerWithMultipleSic!.SicCodeSicText2,
                dmsOwnerWithMultipleSic!.SicCodeSicText3,
                dmsOwnerWithMultipleSic!.SicCodeSicText4
            ].filter(code => code !== null && code !== undefined && code !== '');

            // Find the matching UI owner by company name and read its SIC code(s) field
            const ownerCount = await propertyDetailsPage.getNumberOfPropertyOwners();
            let uiSicCodeValue: string | undefined;
            for (let i = 0; i < ownerCount; i++) {
                const name = await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'Name');
                if (name === dmsOwnerWithMultipleSic!.CompanyName) {
                    uiSicCodeValue = await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'SIC code(s)');
                    break;
                }
            }
            expect(uiSicCodeValue, `No UI owner found matching "${dmsOwnerWithMultipleSic!.CompanyName}"`).toBeDefined();

            // The UI displays each SIC code on its own line (white-space: pre-line) — unlike the CSV
            // export, which joins them with " | ". Split on newline and compare the set of codes so
            // the check is independent of ordering and separator formatting.
            const uiSicCodes = uiSicCodeValue!.split('\n').map(code => code.trim()).filter(code => code !== '');
            expect(
                uiSicCodes.slice().sort(),
                `SIC codes mismatch for "${dmsOwnerWithMultipleSic!.CompanyName}". Expected: ${dmsSicCodes.join(', ')}; Found: ${uiSicCodes.join(', ')}`
            ).toEqual(dmsSicCodes.slice().sort());
        });

        test('Verify offsore landlords are displayed in the Property owner(s) tab', async ({ request }) => {
            // Get a property with an offshore landlord from DMS
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithMultipleLandlords = 
                await dmsApiClient.getPropertyByOwnerLocation({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                }, 'Offshore') ;

            // Extract postcode to use in filter to reduce number of properties
            //  returned in the search results
            const dmsPropertyPostcode = propertyWithMultipleLandlords.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('No valid postcode found for property with offshore landlord');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithMultipleLandlords.property.Name,
                propertyWithMultipleLandlords.property.Number,
                propertyWithMultipleLandlords.property.FlatNameNumber,
                propertyWithMultipleLandlords.property.Line1,
                propertyWithMultipleLandlords.property.Line2,
                propertyWithMultipleLandlords.property.Line3,
                propertyWithMultipleLandlords.property.Town,
                propertyWithMultipleLandlords.property.County,
                propertyWithMultipleLandlords.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with owner with offshore location
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Property owner(s)');

            // Verify that at least one landlord is displayed with Location as Offshore
            const propertyOwnersCount = await propertyDetailsPage.getNumberOfPropertyOwners();
            let offshoreLandlordFound = false;
            for (let i = 0; i < propertyOwnersCount; i++) {
                const uiLocation = await propertyDetailsPage.getPropertyOwnerFieldValueByOwnerIndex(i, 'Location');
                if (uiLocation.trim().toLowerCase() === 'offshore') {
                    offshoreLandlordFound = true;
                    break;
                }
            }
            expect(offshoreLandlordFound, 'Expected at least one offshore landlord to be displayed').toBe(true);
        });
    });

    test.describe('Energy efficiency details Tab Data Validation', () => {

        test('Verify data in the Energy Ratings section of the Energy efficiency details tab matches DMS data', async ({ request }) => {
            // Get a property with EPC energy rating data from DMS 
            // to ensure the Energy efficiency details tab is populated for the test
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithEPCEnergyCertificate = 
                await dmsApiClient.getPropertywithEPCEnergyCertificate({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });
            
            // Extract the property address to search for the property in the UI 
            // and navigate to the Property Details page
            const dmsPropertyStreet = propertyWithEPCEnergyCertificate.property.Line1;
            if (dmsPropertyStreet === null || dmsPropertyStreet === undefined || dmsPropertyStreet === '') {
                throw new Error('Property Line1 is empty — no suitable property found with EPC energy certificate');
            }

            // Extract postcode to use in filter
            // to reduce number of properties returned in the search results
            const dmsPropertyPostcode = propertyWithEPCEnergyCertificate.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with EPC energy certificate');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithEPCEnergyCertificate.property.Name,
                propertyWithEPCEnergyCertificate.property.Number,
                propertyWithEPCEnergyCertificate.property.FlatNameNumber,
                propertyWithEPCEnergyCertificate.property.Line1,
                propertyWithEPCEnergyCertificate.property.Line2,
                propertyWithEPCEnergyCertificate.property.Line3,
                propertyWithEPCEnergyCertificate.property.Town,
                propertyWithEPCEnergyCertificate.property.County,
                propertyWithEPCEnergyCertificate.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with EPC energy certificate
            await filterPropertiesPage.setStreetFilter(dmsPropertyStreet);
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Energy efficiency details');

            // Verify Current energy rating
            const expCurrentEnergyRating = 
                `${propertyWithEPCEnergyCertificate.property.EPCEnergyRatingBand} (${propertyWithEPCEnergyCertificate.property.EPCEnergyRating})`;
            const expCurrentEPCExpiryDateISOFormatted = propertyWithEPCEnergyCertificate.property.EPCExpiryDate;
            const expCurrentEPCExpiryDate = expCurrentEPCExpiryDateISOFormatted
                ? (() => {
                    const datePart = expCurrentEPCExpiryDateISOFormatted.split('T')[0];
                    const [year, month, day] = datePart.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });
                })()
                : null;
            const expEPCTransactionType = propertyWithEPCEnergyCertificate.property.EPCTransactionType;
            const uiCurrentEnergyRating = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Energy efficiency details', 'Current energy rating');
            const uiCurrentEPCExpiryDateText = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Energy efficiency details', 'Current EPC expiry date');
            const uiEPCTransactionType = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Energy efficiency details', 'EPC transaction type');

            expect(uiCurrentEnergyRating, 
                'Mismatch in Current energy rating. Expected: ' + expCurrentEnergyRating + ', Actual: ' + uiCurrentEnergyRating)
                .toBe(expCurrentEnergyRating);
            expect(uiCurrentEPCExpiryDateText, 
                'Mismatch in Current EPC expiry date. Expected: ' + expCurrentEPCExpiryDate + ', Actual: ' + uiCurrentEPCExpiryDateText)
                .toBe(expCurrentEPCExpiryDate);
            expect(uiEPCTransactionType, 
                'Mismatch in EPC transaction type. Expected: ' + expEPCTransactionType + ', Actual: ' + uiEPCTransactionType)
                .toBe(expEPCTransactionType);
        });

        test('Verify EPC History data displayed in the Property Details page', async ({ request }) => {
            // Get a property with multiple EPCs from DMS 
            // to ensure the Energy efficiency details tab is populated for the test
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithMultipleEPCs = 
                await dmsApiClient.getPropertyWithMultipleEPCs({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'A'
                });
            
            // Extract the property address to search for the property in the UI 
            // and navigate to the Property Details page
            const dmsPropertyStreet = propertyWithMultipleEPCs.property.Line1;
            if (dmsPropertyStreet === null || dmsPropertyStreet === undefined || dmsPropertyStreet === '') {
                throw new Error('Property Line1 is empty — no suitable property found with multiple EPCs');
            }

            // Extract postcode to use in filter
            // to reduce number of properties returned in the search results
            const dmsPropertyPostcode = propertyWithMultipleEPCs.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found with multiple EPCs');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithMultipleEPCs.property.Name,
                propertyWithMultipleEPCs.property.Number,
                propertyWithMultipleEPCs.property.FlatNameNumber,
                propertyWithMultipleEPCs.property.Line1,
                propertyWithMultipleEPCs.property.Line2,
                propertyWithMultipleEPCs.property.Line3,
                propertyWithMultipleEPCs.property.Town,
                propertyWithMultipleEPCs.property.County,
                propertyWithMultipleEPCs.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property with multiple EPCs
            await filterPropertiesPage.setStreetFilter(dmsPropertyStreet);
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Energy efficiency details');

            if (!propertyWithMultipleEPCs.EpcCertificates) {
                throw new Error('No EPC certificates found for the property with multiple EPCs');
            }

            // The EPC history is displayed ordered by expiry date, newest first. Sort the DMS
            // certificates the same way so each row can be compared by position — this verifies
            // both the displayed values and the display order.
            const sortedDmsEpcs = [...propertyWithMultipleEPCs.EpcCertificates].sort((a, b) =>
                new Date(b.ExpiryDate ?? 0).getTime() - new Date(a.ExpiryDate ?? 0).getTime());

            // Verify the EPC history section displays a row for every DMS EPC certificate
            const epcHistoryTableData = await propertyDetailsPage.getEPCHistoryTableData();
            expect(epcHistoryTableData.length, 'EPC history row count does not match the number of DMS EPC certificates')
                .toBe(sortedDmsEpcs.length);

            // Verify each EPC row matches the correspondingly-ordered DMS certificate
            for (let i = 0; i < sortedDmsEpcs.length; i++) {
                const dmsEPC = sortedDmsEpcs[i];
                const expEnergyRating = `${dmsEPC.AssetRatingBand} (${dmsEPC.AssetRating})`;
                const expEPCTransactionType = dmsEPC.TransactionType;
                const expEPCExpiryDate = dmsEPC.ExpiryDate
                    ? (() => {
                        const datePart = dmsEPC.ExpiryDate.split('T')[0];
                        const [year, month, day] = datePart.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        });
                    })()
                    : null;

                const uiEnergyRating = epcHistoryTableData[i]['energyRating'];
                const uiEPCExpiryDate = epcHistoryTableData[i]['epcExpiryDate'];
                const uiEPCTransactionType = epcHistoryTableData[i]['epcTransactionType'];

                expect(uiEnergyRating, `Expected energy rating for EPC ${i + 1} to be ${expEnergyRating}`).toBe(expEnergyRating);
                expect(uiEPCExpiryDate, `Expected EPC expiry date for EPC ${i + 1} to be ${expEPCExpiryDate}`).toBe(expEPCExpiryDate);
                expect(uiEPCTransactionType, `Expected EPC transaction type for EPC ${i + 1} to be ${expEPCTransactionType}`).toBe(expEPCTransactionType);
            }
        });

        test('Verify that the Energy efficiency details tab shows "Not found" for each field when there is no EPC rating available for the property in DMS', async ({ request }) => {
            // Get a property without EPC certificates and without EPC history from DMS
            const dmsApiClient = new DMSExportApiClient(request);
            const propertyWithoutEPCs = 
                await dmsApiClient.getPropertyWithoutEPCCertificates({
                    lacodes: [`E09000003`, `E09000004`],
                    energyratingband: 'Unrated'
                });
            
            // Extract the property address to search for the property in the UI 
            // and navigate to the Property Details page
            const dmsPropertyStreet = propertyWithoutEPCs.property.Line1;
            if (dmsPropertyStreet === null || dmsPropertyStreet === undefined || dmsPropertyStreet === '') {
                throw new Error('Property Line1 is empty — no suitable property found without EPCs');
            }

            // Extract postcode to use in filter
            // to reduce number of properties returned in the search results
            const dmsPropertyPostcode = propertyWithoutEPCs.property.Postcode;
            if (dmsPropertyPostcode === null || dmsPropertyPostcode === undefined || dmsPropertyPostcode === '') {
                throw new Error('Property Postcode is empty — no suitable property found without EPCs');
            }

            // Construct property address for the View Details search results validation
            const dmsPropertyAddress = [
                propertyWithoutEPCs.property.Name,
                propertyWithoutEPCs.property.Number,
                propertyWithoutEPCs.property.FlatNameNumber,
                propertyWithoutEPCs.property.Line1,
                propertyWithoutEPCs.property.Line2,
                propertyWithoutEPCs.property.Line3,
                propertyWithoutEPCs.property.Town,
                propertyWithoutEPCs.property.County,
                propertyWithoutEPCs.property.Postcode
            ].filter(part => part !== null && part !== undefined && part !== '').join(', ');

            // Navigate to Property Details page for the property without EPCs
            await filterPropertiesPage.setStreetFilter(dmsPropertyStreet);
            await filterPropertiesPage.setPostcodeFilter(dmsPropertyPostcode);
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(dmsPropertyAddress);

            await propertyDetailsPage.SelectTab('Energy efficiency details');

             // Verify that "Not found" is displayed for each field in the Energy efficiency details tab
            const currentEnergyRatingFields = [
                'Current energy rating', 
                'Current EPC expiry date', 
                'EPC transaction type'
            ];
            for (const fieldName of currentEnergyRatingFields) {
                const fieldValue = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Energy efficiency details', fieldName);
                expect(fieldValue, `Expected "${fieldName}" to be "Not found"`).toBe('Not found');
            }

            // Verify that the EPC history section displays "Not found" when there is no EPC history available for the property in DMS
            const epcHistoryTableData = await propertyDetailsPage.getEPCHistoryTableData();
            expect(epcHistoryTableData.length).toBe(1);
            expect(epcHistoryTableData[0]['energyRating'], 'Expected "energyRating" to be "Not found"').toBe('Not found');
            expect(epcHistoryTableData[0]['epcExpiryDate'], 'Expected "epcExpiryDate" to be "Not found"').toBe('Not found');
            expect(epcHistoryTableData[0]['epcTransactionType'], 'Expected "epcTransactionType" to be "Not found"').toBe('Not found');
        });
    });

    test.describe('PRS exemptions and penalties Tab Data Validation', () => {

        test('Verify possible values for the PRS exemption status field on the PRS exemptions and penalties tab', async ({ page }) => {
            await filterPropertiesPage.setEnergyRatingFilter('B');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('THE COTTAGE NURSERY, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY');

            const exemptionStatusesAndUprns = [
                { uprn: '100022918361', expectedStatus: 'Penalty sent', expectedTagClass: 'govuk-tag--light-blue' },
                { uprn: '10096984308', expectedStatus: 'Received', expectedTagClass: 'govuk-tag--blue' },
                { uprn: '10090795654', expectedStatus: 'Updated', expectedTagClass: 'govuk-tag--orange' },
                { uprn: '10023302263', expectedStatus: 'Approved', expectedTagClass: 'govuk-tag--green' },
                { uprn: '10090792724', expectedStatus: 'Ended', expectedTagClass: 'govuk-tag--pink' },
                { uprn: '10090792726', expectedStatus: 'Not found', expectedTagClass: null }, // No tag for not found
                { uprn: '10090792723', expectedStatus: 'Expired', expectedTagClass: 'govuk-tag--grey' }
            ];

            for (const { uprn, expectedStatus, expectedTagClass } of exemptionStatusesAndUprns) {
                // Navigate to the Property Details page for the property with the specified UPRN
                await page.goto(`${page.url().split('?')[0]}?buildingrefnum=${uprn}`);
                await propertyDetailsPage.waitForPageToLoad();

                await propertyDetailsPage.SelectTab('PRS exemptions and penalties');
                await propertyDetailsPage.waitForPageToLoad();

                // Verify that the PRS exemption status field displays the expected value
                await expect(
                    await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status'),
                    `Expected PRS exemption status for UPRN ${uprn} to be "${expectedStatus}"`).toHaveText(expectedStatus);

                // Verify that the tag class of the PRS exemption status field matches the expected class
                const fieldLocator = await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status');
                if (expectedTagClass !== null) {
                    const tagClass = await fieldLocator.locator('span').getAttribute('class');
                    expect(tagClass, `Expected tag class for UPRN ${uprn} to contain "${expectedTagClass}"`).toContain(expectedTagClass);
                } else {
                    // If no tag class is expected, verify that there is no child span element
                    await expect(fieldLocator.locator('span')).toHaveCount(0);
                }
            }
        });

        test('Verify that property displays exemption and penalty data setup in Salesforce', async () => {
            await filterPropertiesPage.setEnergyRatingFilter('B');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('THE COTTAGE NURSERY, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY');

            await propertyDetailsPage.SelectTab('PRS exemptions and penalties');
            
            // Verify that the PRS exemption details are displayed correctly
            await expect(
                await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status'),
                `Expected PRS exemption status to be "Penalty sent" but found "${(await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status')).innerText()}"`)
                .toHaveText('Penalty sent');

            await expect(
                await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption date'),
                `Expected PRS exemption date to be "22 May 2026" but found "${(await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption date')).innerText()}"`)
                .toHaveText('22 May 2026');

            // Verify that the penalty details are displayed correctly
            await expect(
                await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty'),
                `Expected PRS penalty to be "Recorded" but found "${(await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty')).innerText()}"`)
                .toHaveText('Recorded');

            // The 'PRS Penalty date' is the date when penalty was created and it's not editable in Salesforce,
            // so we verify that the year is correct to avoid false positives in case the date is not displayed in the expected format
            await expect(
                await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty date'),
                `Expected PRS penalty date to be "22 May 2026" but found "${(await propertyDetailsPage.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty date')).innerText()}"`)
                .toContainText('2026');
        });

        test('Prs exemptions and penalty fields display "Not found" when there is no data in Salesforce', async () => {

            // Navigate to a property with no PRS exemption or penalty data in Salesforce (using a property with no landlord information as a proxy for this)
            await filterPropertiesPage.setEnergyRatingFilter('Unrated');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            const propertyDetailsPageNonExemp = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(
                'DOUGAL BROS TRANSPORT LTD, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY');
            await propertyDetailsPageNonExemp.SelectTab('PRS exemptions and penalties');

            // Verify that "Not found" is displayed for each PRS exemption and penalty field
            const prsFields = [
                'PRS exemption status',
                'PRS exemption date',
                'PRS penalty',
                'PRS penalty date'
            ];
            for (const field of prsFields) {
                const fieldValue = await propertyDetailsPageNonExemp.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', field);
                await expect(fieldValue, `Expected ${field} to be "Not found" but found "${await fieldValue.innerText()}"`).toHaveText('Not found');
            }
        });

        test('Verify that the PRS exemptions and penalties tab displays penalty information for non-exempt properties', async () => {
            // Navigate to a property with PRS penalty data but no exemption in Salesforce
            await filterPropertiesPage.setEnergyRatingFilter('G');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            const propertyDetailsPagePenaltyOnly = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(
                '6, London Road, Crayford, DARTFORD, DA1 4BH');
            await propertyDetailsPagePenaltyOnly.SelectTab('PRS exemptions and penalties');

            // Verify that the PRS exemption status field displays "Not found"
            const exemptionStatusField = await propertyDetailsPagePenaltyOnly.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status');
            await expect(exemptionStatusField, `Expected PRS exemption status to be "Not found" but found "${await exemptionStatusField.innerText()}"`).toHaveText('Not found');
            const exemptionDateField = await propertyDetailsPagePenaltyOnly.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption date');
            await expect(exemptionDateField, `Expected PRS exemption date to be "Not found" but found "${await exemptionDateField.innerText()}"`).toHaveText('Not found');

            // Verify that the PRS penalty fields display the correct information
            const penaltyField = await propertyDetailsPagePenaltyOnly.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty');
            await expect(penaltyField, `Expected PRS penalty to be "Recorded" but found "${await penaltyField.innerText()}"`).toHaveText('Recorded');
            const penaltyDateField = await propertyDetailsPagePenaltyOnly.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', 'PRS penalty date');
            await expect(penaltyDateField, `Expected PRS penalty date to be "26 May 2026" but found "${await penaltyDateField.innerText()}"`).toContainText('2026');
        });

        test('Verify that PRSE penalty data is not retrieved for a non-exempt property without UPRN', async () => {
            // Navigate to a property without UPRN, without exemption, and with a penalty recorded in PRSE
            // PRSE data cannot be linked to properties without a UPRN
            await filterPropertiesPage.setEnergyRatingFilter('A');
            const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
            await viewPropertiesPage.waitForTableContent();
            const propertyDetailsPageNoUprn = await viewPropertiesPage.ViewDetailsForPropertyWithAddress(
                'Unit 2B, Roman Way, Crayford, DARTFORD, DA1 4FY');
            await propertyDetailsPageNoUprn.SelectTab('PRS exemptions and penalties');

            // Verify all PRS fields display 'Not found' — the system cannot retrieve PRSE data without a UPRN
            const prsFields = [
                'PRS exemption status',
                'PRS exemption date',
                'PRS penalty',
                'PRS penalty date'
            ];
            for (const field of prsFields) {
                const fieldValue = await propertyDetailsPageNoUprn.getFieldValueLocatorByTabNameAndFieldName('PRS exemptions and penalties', field);
                await expect(fieldValue, `Expected ${field} to be "Not found" but found "${await fieldValue.innerText()}"`).toHaveText('Not found');
            }
        });
    });

    test('Verify data displayed in the main section of the Property Details page for property without UPRN', async ({ page, request }) => {
        // Navigate to a property that does not have UPRN (buildingReferenceNumber = 858945)
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.setPostcodeFilter('DA1 4FY');
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        const propertyDetailsPageNoUprn = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 2B, Roman Way, Crayford, DARTFORD, DA1 4FY');
        
        // Verify URL contains buildingrefnum parameter (not uprn parameter)
        const currentUrl = page.url();
        expect(currentUrl).toContain('buildingrefnum=858945');
        expect(currentUrl).not.toContain('uprn=');
        
        // Get DMS property details for comparison
        const dmsPropertyDetailsNoUprn = await propertyDetailsPageNoUprn.GetDMSPropertyDetailsValues(request, null, '858945');
        
        // Helper function to construct address from DMS data
        const constructAddress = (property: any) => {
            const addressParts = [
                property.line1,
                property.line2,
                property.line3,
                property.town,
                property.postcode
            ].filter(part => part !== null && part !== '').join('\n');
            return addressParts;
        };

        // Verify Address (DMS)
        const expectedAddress = constructAddress(dmsPropertyDetailsNoUprn.property);
        await propertyDetailsPageNoUprn.SelectTab('Property details');
        expect(await propertyDetailsPageNoUprn.getPropertyDetailsByTabNameAndFieldName(
            'Property details', 'Property address')).toBe(expectedAddress);

        // Verify UPRN field displays 'Not found' when property has no UPRN
        const uprnValue = await propertyDetailsPageNoUprn.getPropertyDetailsByTabNameAndFieldName('Property details', 'UPRN');
        expect(uprnValue).toBe('Not found');
    });
});

test.describe('Property Details Comments Tests', () => {
    let propertyDetailsPage: PropertyDetailsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    // Validate add comment functionality, saving a comment and verifying that it is displayed in the Previous Comments section
    test('Should add a comment and verify it appears in previous comments with annotation', async ({ page }, testInfo) => {
        const uniqueComment = `Test comment ${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Add comment - directly using page methods
        await propertyDetailsPage.addComment(uniqueComment);
        await propertyDetailsPage.saveComment();
        const propertyCommentsWithAnnotations = await propertyDetailsPage.getCommentsTestData();

        expect(propertyCommentsWithAnnotations).toContainEqual(expect.objectContaining({ commentText: uniqueComment }));

        // BUG 941 WORKAROUND: annotation currently uses email, not user name/surname.
        // Expected annotation currently follows invalid behavior until bug 941 is fixed.
        const currentUserIdentifier = getExpectedCommentAnnotationUserIdentifier(page);
        // Construct expected expected date with ordinal suffix
        const currentDate = new Date();
        const day = currentDate.getDate();
        const getOrdinalSuffix = (day: number) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
        const month = currentDate.toLocaleDateString('en-GB', { month: 'long' });
        const year = currentDate.getFullYear();
        // Expected annotation format:
        const expectedAnnotation = `Added by ${currentUserIdentifier} on ${dayWithSuffix} ${month} ${year}`;

           expect(propertyCommentsWithAnnotations).toContainEqual(expect.objectContaining({ commentAnnotations: expectedAnnotation }));
    });

    // Validate that cancel button clear the comment input and does not save the comment
    test('Should not save comment when cancel is clicked', async () => {
        const uniqueComment = `Test comment ${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Enter comment and click cancel
        await propertyDetailsPage.addComment(uniqueComment);
        await propertyDetailsPage.cancelComment();
        await propertyDetailsPage.waitForPageToLoad();
        const propertyCommentsWithAnnotations = await propertyDetailsPage.getCommentsTestData();

        // Verify comment does not appear in previous comments
        expect(propertyCommentsWithAnnotations).not.toContainEqual(expect.objectContaining({ commentText: uniqueComment }));
    });

    // Validate comments must have the text entered before they can be saved, and an error message is displayed if trying to save an empty comment
    test('Should display error when trying to save an empty comment', async () => {
        // Attempt to save an empty comment
        await propertyDetailsPage.addComment('');
        await propertyDetailsPage.saveComment();

        // Verify error message is displayed
        expect(await propertyDetailsPage.isCommentTextAreaInErrorState()).toBe(true);
    });
});

test.describe('Property Details Page Navigation Tests', () => {
    let propertyDetailsPage: PropertyDetailsPage;
    

    test.beforeEach(async ({ page, request }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
        
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    test('Should navigate to Home page when clicking Home breadcrumb link', async () => {
        const homePage = await propertyDetailsPage.clickBreadcrumbHome();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Should navigate to Filter Properties page when clicking Filter Properties breadcrumb link', async () => {
        const filterPropertiesPage = await propertyDetailsPage.clickBreadcrumbFilterProperties();
        expect(await filterPropertiesPage.isDisplayed()).toBe(true);
    });

    test('Should navigate to View Properties page when clicking View Properties breadcrumb link', async () => {
        const viewPropertiesPage = await propertyDetailsPage.clickBreadcrumbViewProperties();
        expect(await viewPropertiesPage.isDisplayed()).toBe(true);
    });

    test('Should navigate to the Filter Properties page when clicking on Property Records tab in the header', async () => {
        const filterPropertiesPage = await propertyDetailsPage.clickOnPropertyRecordsTab();
        expect(await filterPropertiesPage.isDisplayed()).toBe(true);
    });

    test('Should navigate to Home page when clicking page header link', async () => {
        const homePage = await propertyDetailsPage.clickPageHeaderLink();
        expect(await homePage.isDisplayed()).toBe(true);
    });

    test('Should navigate to the correct URL when clicking on the link for where the data comes from', async ({ page }) => {
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            propertyDetailsPage.clickLinkWhereThisDataComesFrom(),
        ]);
        await newPage.waitForLoadState();
        await expect(newPage).toHaveURL(/\/compliance\/guidance-detail/);
    });
});

test.describe('Property Details Page Accessibility Tests', () => {
    let propertyDetailsPage: PropertyDetailsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY)
        );

        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    test('Should activate each tab using the Enter key', async ({ page }) => {
        // The 'Property details' tab is active by default; test all other tabs then return to it
        const tabs: { tabName: string; panelId: string }[] = [
            { tabName: 'Property owner(s)',             panelId: 'PropertyOwnerTab'      },
            { tabName: 'Energy efficiency details',     panelId: 'EPCTab'                },
            { tabName: 'PRS exemptions and penalties',  panelId: 'PRSTab'                },
            { tabName: 'Property details',              panelId: 'PropertyDetailsTab'    },
        ];

        for (const { tabName, panelId } of tabs) {
            const tabLink = page.locator(`//li/a[contains(text(), '${tabName}')]`);

            // Focus the tab link and activate it with the Enter key
            await tabLink.focus();
            await page.keyboard.press('Enter');

            // Verify the tab panel is visible and the tab is marked as selected
            await expect(
                page.locator(`[data-id="${panelId}"]`),
                `Tab panel for '${tabName}' should be visible after pressing Enter`
            ).toBeVisible();

            await expect(
                tabLink.locator('..'),
                `Tab '${tabName}' should be marked as selected after pressing Enter`
            ).toHaveClass(/govuk-tabs__list-item--selected/);
        }
    });
});

