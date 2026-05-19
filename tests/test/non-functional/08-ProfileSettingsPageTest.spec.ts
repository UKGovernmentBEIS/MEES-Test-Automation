import { test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Profile Settings Non-Functional Tests', () => {

    test('Profile Settings Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.PROFILE_SETTINGS_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();

        await baseTest.verifyAccessibility(PageName.PROFILE_SETTINGS_PAGE);
        const locators = await profileSettingsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Change Contact Details Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.CHANGE_CONTACT_DETAILS_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await baseTest.verifyAccessibility(PageName.CHANGE_CONTACT_DETAILS_PAGE);
        const locators = await changeContactDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Change Contact Details Page - First Name Validation Error', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.CHANGE_CONTACT_DETAILS_FIRST_NAME_ERROR);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await changeContactDetailsPage.clearFirstName();
        await page.getByRole('button', { name: 'Save and continue' }).click();
        await changeContactDetailsPage.getFirstNameError().waitFor();

        await baseTest.verifyAccessibility(PageName.CHANGE_CONTACT_DETAILS_FIRST_NAME_ERROR);
        const locators = await changeContactDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Change Contact Details Page - Last Name Validation Error', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.CHANGE_CONTACT_DETAILS_LAST_NAME_ERROR);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await changeContactDetailsPage.clearLastName();
        await page.getByRole('button', { name: 'Save and continue' }).click();
        await changeContactDetailsPage.getLastNameError().waitFor();

        await baseTest.verifyAccessibility(PageName.CHANGE_CONTACT_DETAILS_LAST_NAME_ERROR);
        const locators = await changeContactDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Check Contact Details Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.CHECK_CONTACT_DETAILS_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();

        await baseTest.verifyAccessibility(PageName.CHECK_CONTACT_DETAILS_PAGE);
        const locators = await checkContactDetailsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Contact Details Confirmation Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.CONTACT_DETAILS_CONFIRMATION_PAGE);

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();
        const confirmationPage = await checkContactDetailsPage.clickConfirmAndSave();

        await baseTest.verifyAccessibility(PageName.CONTACT_DETAILS_CONFIRMATION_PAGE);
        const locators = await confirmationPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});
