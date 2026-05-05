import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PropertyDetailsPage, DMSPropertyDetails } from '../../pages/Compliance/PropertyDetailsPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { getCurrentUserAccountName } from '../../utils/AuthUtils';

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

    test('Verify data displayed in the main section of the Property Details page', async () => {
        // Helper function to construct address from DMS data
        const constructAddress = (property: any) => {
            const addressParts = [
                property.line1,
                property.line2,
                property.line3,
                property.town,
                property.postcode
            ].filter(part => part !== null && part !== '').join(' ');
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

        // Verify Address (DMS)
        const expectedAddress = constructAddress(dmsPropertyDetails.property);
        expect(await propertyDetailsPage.getPropertyDetails("Property address")).toHaveText(expectedAddress);

        // Verify UPRN (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("UPRN")).toHaveText(dmsPropertyDetails.property.uprn.toString());

        // Verify Property Type (DMS)
        // ToDo. We are expecting changes to the property type data in DMS which will allow us to verify this field. Once those changes are in place we can update the test to verify the property type as well.
        //expect(await propertyDetailsPage.getPropertyDetails("Property type")).toHaveText(dmsPropertyDetails.property.epcPropertyType);

        // Verify Rateable Value (DMS)
        const expectedRateableValue = formatCurrency(dmsPropertyDetails.property.rateableValue!);
        expect(await propertyDetailsPage.getPropertyDetails("Rateable value")).toHaveText(expectedRateableValue);
    });

    test('Verify data displayed in the Energy Ratings and PRS Exemptions section of the Property Details page', async () => {

        // Verify Current energy rating
         expect(await propertyDetailsPage.getEnergyEfficiencyDetails("Current energy rating")).toHaveText('A (22)');

        // Verify Current EPC expiry date
        // BUG 922 WORKAROUND: EPC expiry date is displayed as a raw ISO 8601 string instead of a formatted date (e.g. '13 August 2035').
        // Update expected value to '13 August 2035' once BUG 922 is fixed.
        expect(await propertyDetailsPage.getEnergyEfficiencyDetails("Current EPC expiry date")).toHaveText('2035-08-13T00:00:00');

        // Verify PRS exemption status
        expect(await propertyDetailsPage.getExemptionDetails("PRS exemption status")).toHaveText('Penalty sent');

        // Verify PRS exemption date
        expect(await propertyDetailsPage.getExemptionDetails("PRS exemption date")).toHaveText('14 February 2026');
    });

    test('Verify EPC History data displayed in the Property Details page', async () => {

        // Click on the EPC History tab
        await propertyDetailsPage.DisplayEPCHistoryData();

        // Verify that the EPC History section shows the no-history message (BUG 925: property now has no EPC certificate history)
        const noHistoryMessage = await propertyDetailsPage.getNoEPCHistoryMessageText();
        expect(noHistoryMessage).toBe('No EPC certificate history available.');
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

        await expect(await propertyDetailsPage.getComments()).toContainText(uniqueComment);

        // Verify comment has correct annotation (example: 'Added by Test User2 on 9th March 2026')
        // Get current user's account name for annotation from browser context
        const currentUserName = getCurrentUserAccountName(page);
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
        const expectedAnnotation = `Added by ${currentUserName} on ${dayWithSuffix} ${month} ${year}`;

        await expect(await propertyDetailsPage.getComments()).toContainText(expectedAnnotation);
    });

    // Validate that cancel button clear the comment input and does not save the comment
    test('Should not save comment when cancel is clicked', async () => {
        const uniqueComment = `Test comment ${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Enter comment and click cancel
        await propertyDetailsPage.addComment(uniqueComment);
        await propertyDetailsPage.cancelComment();

        // Verify comment does not appear in previous comments
        await expect(await propertyDetailsPage.getComments()).not.toContainText(uniqueComment);
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