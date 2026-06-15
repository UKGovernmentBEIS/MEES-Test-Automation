import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, PageName } from '../../utils/TestTypes';
import { ViewPropertiesPage } from '../../pages/Compliance/ViewPropertiesPage';
import { FilterPropertiesPage } from '../../pages/Compliance/FilterPropertiesPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { PropertyDetailsPage } from '../../pages/Compliance/PropertyDetailsPage';

test.describe('Property Details Page Non-Functional Tests', () => {
    let baseTest: BaseNonFunctionalTest;
    let propertyDetailsPage: PropertyDetailsPage;
    
    test.beforeEach(async ({ page }, testInfo) => {
        baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PROPERTY_DETAILS_PAGE, [TestType.ACCESSIBILITY, TestType.CONTEXT_VERIFICATION]);

        // Navigate to the Property Details page
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage: HomePage = await landingPage.clickSignIn_AuthenticatedUser();
        const filterPropertiesPage: FilterPropertiesPage = await homePage.clickViewProperties();
        await filterPropertiesPage.setEnergyRatingFilter('A');
        await filterPropertiesPage.selectEvidenceFoundRentalEvidence();
        const viewPropertiesPage: ViewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
        await viewPropertiesPage.waitForTableContent();
        propertyDetailsPage = await viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
    });

    test('Property Details page with Property details tab selected', async () => {
        // Verify accessibility on the Property Details page
        await baseTest.verifyAccessibility(PageName.PROPERTY_DETAILS_PAGE);

        // Verify page context on the Property Details page
        const locators = await propertyDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Property Details page with the Property owner(s) tab selected', async () => {
        await propertyDetailsPage.SelectTab('Property owner(s)');

        // Verify accessibility on the Property Details page
        await baseTest.verifyAccessibility(PageName.PROPERTY_DETAILS_PAGE);

        // Verify page context on the Property Details page. Additionally capture the static
        // "Standard Industrial Classification codes" label (owner-tab only); the codes
        // themselves are data-dependent and verified by the functional tests.
        const locators = await propertyDetailsPage.getPageContextLocator();
        locators.push(propertyDetailsPage.getSicCodeLabel().first());
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Property Details page with the Energy efficiency details tab selected', async () => {
        await propertyDetailsPage.SelectTab('Energy efficiency details');

        // Verify accessibility on the Property Details page
        await baseTest.verifyAccessibility(PageName.PROPERTY_DETAILS_PAGE);

        // Verify page context on the Property Details page
        const locators = await propertyDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Property Details page with the PRS exemptions and penalties tab selected', async () => {
        await propertyDetailsPage.SelectTab('PRS exemptions and penalties');

        // Verify accessibility on the Property Details page
        await baseTest.verifyAccessibility(PageName.PROPERTY_DETAILS_PAGE);

        // Verify page context on the Property Details page. Additionally capture the static PRSe
        // register sentence/link (PRS-tab only); the PRS exemption/penalty values are
        // data-dependent and verified by the functional tests.
        const locators = await propertyDetailsPage.getPageContextLocator();
        locators.push(propertyDetailsPage.getPRSeRegisterParagraph());
        await baseTest.verifyContextWithLocators(locators);
    });
});