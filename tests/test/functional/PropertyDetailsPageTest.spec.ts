import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PropertyDetailsPage, DMSPropertyDetails } from '../../pages/Compliance/PropertyDetailsPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { getCurrentUserAccountName } from '../../utils/AuthUtils';

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
        
        // Get DMS property details for comparison
        dmsPropertyDetails = await propertyDetailsPage.GetDMSPropertyDetailsValues(request, '100022918361');
    });

    test('Verify data displayed in the Property details tab for property with UPRN', async () => {
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
            { possibleEvidenceEpcTransactionType: true, possibleEvidenceSiccode: true, expectedPossibleRentalEvidence: 'Mandatory issue (Property to let) EPC transaction type\nProperty owner has letting company SIC code' },
            { possibleEvidenceEpcTransactionType: true, possibleEvidenceSiccode: false, expectedPossibleRentalEvidence: 'Mandatory issue (Property to let) EPC transaction type' },
            { possibleEvidenceEpcTransactionType: false, possibleEvidenceSiccode: true, expectedPossibleRentalEvidence: 'Property owner has letting company SIC code' },
            { possibleEvidenceEpcTransactionType: false, possibleEvidenceSiccode: false, expectedPossibleRentalEvidence: 'Not found' },
        ];

        const uprnForPropertyWithoutPossibleEvidence = '100022917839';
        const uprnForPropertyWithBothPossibleEvidence = '10023302621';
        const uprnForPropertyWithOnlyEpcEvidence = '100022918419';
        const uprnForPropertyWithOnlySiccodeEvidence = '10011861801';
       
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
            expect(actualPossibleEvidence).toBe(testCase.expectedPossibleRentalEvidence);
        }
    });

    test('Verify data displayed in the Energy Ratings and PRS Exemptions section of the Property Details page', async () => {

        // Verify Current energy rating
        await propertyDetailsPage.SelectTab('Energy efficiency details');
        const energyRatingText = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('Energy efficiency details', 'Current energy rating');
        expect(energyRatingText).toBe('A (22)');

        // Verify Current EPC expiry date
        // BUG 922 WORKAROUND: EPC expiry date is displayed as a raw ISO 8601 string instead of a formatted date (e.g. '13 August 2035').
        // Update expected value to '13 August 2035' once BUG 922 is fixed.
        const epcExpiryDateText = 
            await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName(
                'Energy efficiency details', 'Current EPC expiry date');
        expect(epcExpiryDateText).toBe('2035-08-13T00:00:00');

        // Verify PRS exemption status
        await propertyDetailsPage.SelectTab('PRS exemptions and penalties');
        const prsExemptionStatusText = 
            await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption status');
        expect(prsExemptionStatusText).toBe('Penalty sent');

        // Verify PRS exemption date
        const prsExemptionDateText = await propertyDetailsPage.getPropertyDetailsByTabNameAndFieldName('PRS exemptions and penalties', 'PRS exemption date');
        expect(prsExemptionDateText).toBe('14 February 2026');
    });

    test('Verify EPC History data displayed in the Property Details page', async () => {

        // Click on the EPC History tab
        await propertyDetailsPage.SelectTab('Energy efficiency details');

        // Verify that the EPC History table contains 2 records
        const epcHistory = await propertyDetailsPage.getEPCHistoryTableData();
        expect(epcHistory).toHaveLength(2);

        // Verify the first EPC History record
        expect(epcHistory[0].assetRatingBand).toBe('A (22)');
        expect(epcHistory[0].expiryDate).toBe('13 August 2035');
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
});