import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { GuidanceMainPage, TemplateTypes } from '../../pages/Compliance/Guidance/GuidanceMainPage';
import { GuidanceHowPRSPropertiesAreIdentifiedPage } from '../../pages/Compliance/Guidance/GuidanceHowPRSPropertiesAreIdentified';
import { PenaltyCalculatorPage } from '../../pages/Compliance/PenaltyCalculatorPage';
import { HomePage } from '../../pages/Compliance/HomePage';

test.describe('Guidance Main Page', () => {
    let guidanceMainPage: GuidanceMainPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        guidanceMainPage = await homePage.clickGuidanceLink();
        await guidanceMainPage.waitForPageToLoad();
    });

    test('should display the Guidance Main Page', async () => {
        const isDisplayed = await guidanceMainPage.isDisplayed();
        expect(isDisplayed).toBeTruthy();
    });

    test('Navigation to the Home page from the breadcrumb should work correctly', async () => {
        const homePage = await guidanceMainPage.clickHomeBreadcrumb();
        const isHomePageDisplayed = await homePage.isDisplayed();
        expect(isHomePageDisplayed).toBeTruthy();
    });

    test('Navigation to the View Properties page using tab should work correctly', async () => {
        const homePage = await guidanceMainPage.clickOnPropertyRecordsTab();
        const isHomePageDisplayed = await homePage.isDisplayed();
        expect(isHomePageDisplayed).toBeTruthy();
    });

    test('Navigation to the Penalty Calculator page using tab should work correctly', async () => {
        const penaltyCalculatorPage: PenaltyCalculatorPage = await guidanceMainPage.clickOnPenaltyCalculatorTab();  
        await penaltyCalculatorPage.waitForPageToLoad();
        expect(await penaltyCalculatorPage.isDisplayed()).toBeTruthy();
    });

    test('Should navigate to Home page when clicking page header link', async () => {
        const landingPage = await guidanceMainPage.clickPageHeaderLink();
        expect(await landingPage.isDisplayed()).toBe(true);
    });
});

test.describe('Guidance sub-pages', () => {
    let guidanceMainPage: GuidanceMainPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        guidanceMainPage = await homePage.clickGuidanceLink();
        await guidanceMainPage.waitForPageToLoad();
    });

    test('Should navigate correctly to the Home page using breadcrumb', async () => {
        for (const templateType of Object.values(TemplateTypes)) {
            // Click on the template link to navigate to the template page
            const templatePage = await guidanceMainPage.clickTemplateLink(templateType);
            await templatePage.waitForPageToLoad();

            // Click on the breadcrumb to navigate to the Home page
            const homePage: HomePage = await templatePage.clickHomeBreadcrumb();
            await homePage.waitForPageToLoad();

            // Verify that the Home page is displayed
            expect(await homePage.isDisplayed()).toBeTruthy();

            // Navigate back to guidance page for next iteration
            guidanceMainPage = await homePage.clickGuidanceLink();
            await guidanceMainPage.waitForPageToLoad();
        }
    });

    test('Should navigate correctly to the Guidance Main page using breadcrumb', async () => {
        for (const templateType of Object.values(TemplateTypes)) {
            // Click on the template link to navigate to the template page
            const templatePage = await guidanceMainPage.clickTemplateLink(templateType);
            await templatePage.waitForPageToLoad();

            // Click on the breadcrumb to navigate back to the Guidance Main page
            guidanceMainPage = await templatePage.clickGuidanceBreadcrumb();
            await guidanceMainPage.waitForPageToLoad();

            // Verify that the Guidance Main page is displayed
            expect(await guidanceMainPage.isDisplayed()).toBeTruthy();
        }
     });

     test('Should navigate correctly to the View Properties page using tab', async () => {
        for (const templateType of Object.values(TemplateTypes)) {
            // Click on the template link to navigate to the template page
            const templatePage = await guidanceMainPage.clickTemplateLink(templateType);
            await templatePage.waitForPageToLoad();

            // Click on the View Properties tab to navigate back to the View Properties page
            const viewPropertiesPage = await templatePage.clickOnPropertyRecordsTab();
            await viewPropertiesPage.waitForPageToLoad();

            // Verify that the View Properties page is displayed
            expect(await viewPropertiesPage.isDisplayed()).toBeTruthy();

            // Navigate back to guidance page for next iteration (ViewProperties -> Home -> Guidance)
            const homePage = await viewPropertiesPage.clickBreadcrumbHome();
            await homePage.waitForPageToLoad();
            guidanceMainPage = await homePage.clickGuidanceLink();
            await guidanceMainPage.waitForPageToLoad();
        }
     });
});

test.describe('How PRS Properties Are Identified Guidance Page', () => {
    let prsPage: GuidanceHowPRSPropertiesAreIdentifiedPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();
        await guidanceMainPage.waitForPageToLoad();
        prsPage = await guidanceMainPage.clickTemplateLink(TemplateTypes.HOW_PRS_PROPERTIES_ARE_IDENTIFIED) as GuidanceHowPRSPropertiesAreIdentifiedPage;
    });

    test('External legislation link should open in a new tab', async () => {
        const newTab = await prsPage.clickEnergyEfficiencyRegulationsLinkAndGetNewTab();
        expect(newTab.url()).toContain('legislation.gov.uk');
    });
});

test.describe('Penalty calculator guidance page', () => {
    let penaltyCalculatorGuidancePage: PenaltyCalculatorPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const guidanceMainPage = await homePage.clickGuidanceLink();
        await guidanceMainPage.waitForPageToLoad();
        penaltyCalculatorGuidancePage = await guidanceMainPage.clickOnPenaltyCalculatorTab();
    });

    test('The  Penalty Calculator link should navigate to the Penalty Calculator page', async () => {
        const penaltyCalculatorPage = await penaltyCalculatorGuidancePage.clickPenaltyCalculatorLink();

        await expect(penaltyCalculatorPage.isDisplayed(), 'Penalty Calculator page should be displayed').resolves.toBeTruthy();
    });
});