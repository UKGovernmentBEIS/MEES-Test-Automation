import { test } from '../../fixtures/authFixtures';
import { expect } from '@playwright/test';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PropertyDetailsPage } from '../../pages/Compliance/PropertyDetailsPage';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';

test.describe('View Properties Page Data Validation Tests', () => {
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
        await filterPropertiesPage.selectOnshoreLALocations();
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    test('Verify data displayed in the main section of the Property Details page', async () => {

        // Verify Address (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Property address")).toHaveText('Unit 47, Acorn Industrial Park Crayford Road Crayford DARTFORD DA1 4AL');

        // Verify UPRN (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("UPRN")).toHaveText('100022918361');

        // Verify Exemption Reference (Salesforce)
        expect(await propertyDetailsPage.getPropertyDetails("Exemption reference")).toHaveText('test');

        // Verify Property Type (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Property type")).toHaveText('General Industrial and Special Industrial Groups');

        // Verify Rateable Value (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Rateable value")).toHaveText('£25,500');

        // Verify Landlord Name (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Landlord")).toHaveText('BRITISH OVERSEAS BANK NOMINEES LIMITED');

        // Verify Landlord Location (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Landlord location")).toHaveText('Onshore');

        // Verify Landlord Address (DMS)
        expect(await propertyDetailsPage.getPropertyDetails("Landlord address")).toHaveText('250 Bishopsgate, London EC2M 4AA');
    });

    test('Verify data displayed in the Energy Ratings and PRS Exemptions section of the Property Details page', async () => {

        // Verify Current energy rating
         expect(await propertyDetailsPage.getExemptionDetails("Current energy rating")).toHaveText('A');

        // Verify Current EPC expiry date
        expect(await propertyDetailsPage.getExemptionDetails("Current EPC expiry date")).toHaveText('20 February 2026');

        // Verify PRS exemption status
        expect(await propertyDetailsPage.getExemptionDetails("PRS exemption status")).toHaveText('Penalty sent');

        // Verify PRS exemption date
        expect(await propertyDetailsPage.getExemptionDetails("PRS exemption date")).toHaveText('2026-02-14T16:32:00.000Z');
    });

    test('Verify EPC History data displayed in the Property Details page', async () => {

        // Click on the EPC History tab
        await propertyDetailsPage.DisplayEPCHistoryData();

        // Verify that there is an EPC History section and it contains expected data
        const epcHistoryData = await propertyDetailsPage.getEPCHistoryTableData();
        expect(epcHistoryData.length).toBeGreaterThan(0);
        expect(epcHistoryData[0].assetRatingBand).toBe('A');
        expect(epcHistoryData[0].lodgementDate).toBe('13 August 2025');
        expect(epcHistoryData[0].expiryDate).toBe('13 August 2035');
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
        await filterPropertiesPage.selectOnshoreLALocations();
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    // Validate add comment functionality, saving a comment and verifying that it is displayed in the Previous Comments section
    test('Should add a comment and verify it appears in previous comments', async () => {
        const uniqueComment = `Test comment ${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Add comment - directly using page methods
        await propertyDetailsPage.addComment(uniqueComment);

        // Verify comment appears
        expect(await propertyDetailsPage.previousComments()).toHaveText(uniqueComment);
    });

    // Validate that cancelling a comment does not save the comment and it is not displayed in the Previous Comments section

    // Validate that the Previous Comments section displays existing comments and can be expanded to show all comments when there are multiple comments

    // Validate comments must have the text entered before they can be saved, and an error message is displayed if trying to save an empty comment
});