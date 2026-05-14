import { test, expect } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { HomePage } from '../../pages/Compliance/HomePage';
import { ProfileSettingsPage } from '../../pages/Compliance/ProfileSettingsPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

test.describe('Profile Settings - Global Header', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    test('Profile settings link is visible in the global header on authenticated pages', async ({ page }) => {
        expect(await homePage.isProfileSettingsLinkVisible()).toBeTruthy();
    });

    test('Profile settings link navigates to the Profile settings page', async ({ page }) => {
        const profileSettingsPage = await homePage.clickProfileSettings();
        expect(await profileSettingsPage.isDisplayed()).toBeTruthy();
        await expect(page).toHaveURL(/.*profile/);
    });
});

test.describe('Profile Settings Page', () => {
    let profileSettingsPage: ProfileSettingsPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        profileSettingsPage = await homePage.clickProfileSettings();
    });

    test.skip('Profile settings page heading is correct', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Profile settings', level: 1 })).toBeVisible();
    });

    test('Profile settings page has a Back link that returns to the home page', async ({ page }) => {
        expect(await profileSettingsPage.isBackLinkVisible()).toBeTruthy();
        const homePage = await profileSettingsPage.clickBack();
        expect(await homePage.isDisplayed()).toBeTruthy();
    });

    test('Contact details section displays the correct user details', async ({ page }) => {
        const firstName = await profileSettingsPage.getContactDetailValue('First name');
        const lastName = await profileSettingsPage.getContactDetailValue('Last name');
        const email = await profileSettingsPage.getContactDetailValue('Email address');

        // Two test accounts may run across workers — accept either user's valid data
        const validLastNames = ['user1', 'user2'];
        const validEmails = ['testusertriad123+001@gmail.com', 'testusertriad123+002@gmail.com'];
        expect(firstName.trim()).toBe('test');
        expect(validLastNames).toContain(lastName.trim());
        expect(validEmails).toContain(email.trim());
    });

    test('Change link is present for first name and last name but not email address', async ({ page }) => {
        expect(await profileSettingsPage.isChangeLinkPresent('First name')).toBeTruthy();
        expect(await profileSettingsPage.isChangeLinkPresent('Last name')).toBeTruthy();
        expect(await profileSettingsPage.isChangeLinkPresent('Email address')).toBeFalsy();
    });

    test.skip('Councils are listed in alphabetical order', async ({ page }) => {
        const councils = await profileSettingsPage.getCouncilNames();
        expect(councils.length).toBeGreaterThan(0);
        const sorted = [...councils].sort();
        expect(councils).toEqual(sorted);
    });

    test('Council data sets section displays the correct councils', async ({ page }) => {
        const councils = await profileSettingsPage.getCouncilNames();
        expect(councils.some(c => c.includes('LONDON BOROUGH OF BARNET'))).toBeTruthy();
        expect(councils.some(c => c.includes('LONDON BOROUGH OF BEXLEY'))).toBeTruthy();
    });

    test('If you need help section is displayed with a Help link', async ({ page }) => {
        expect(await profileSettingsPage.isHelpSectionVisible()).toBeTruthy();
        expect(await profileSettingsPage.isHelpLinkVisible()).toBeTruthy();
    });
});

test.describe('Change Contact Details Page', () => {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    test.skip('Change contact details page heading is correct', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await expect(page.getByRole('heading', { name: 'Change your contact details', level: 1 })).toBeVisible();
        expect(await changeContactDetailsPage.isDisplayed()).toBeTruthy();
    });

    test('Back button on Change contact details page returns to Profile settings page', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const returnedProfileSettingsPage = await changeContactDetailsPage.clickBack();

        expect(await returnedProfileSettingsPage.isDisplayed()).toBeTruthy();
    });

    test('Form fields are pre-populated with existing contact details', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        const validLastNames = ['user1', 'user2'];
        expect(await changeContactDetailsPage.getFirstNameValue()).toBe('test');
        expect(validLastNames).toContain((await changeContactDetailsPage.getLastNameValue()).trim());
    });

    test('Validation error is shown when first name is empty', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await changeContactDetailsPage.clearFirstName();
        await page.getByRole('button', { name: 'Save and continue' }).click();

        const error = await changeContactDetailsPage.getFirstNameError();
        expect(error).toContain('Enter a first name');
    });

    test('Validation error is shown when last name is empty', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        await changeContactDetailsPage.clearLastName();
        await page.getByRole('button', { name: 'Save and continue' }).click();

        const error = await changeContactDetailsPage.getLastNameError();
        expect(error).toContain('Enter a last name');
    });

    test('Save and continue navigates to Check your contact details page', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();

        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();

        expect(await checkContactDetailsPage.isDisplayed()).toBeTruthy();
        await expect(page).toHaveURL(/.*profile#CheckDetailsSummary/);
    });
});

test.describe('Check Contact Details Page', () => {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    test.skip('Check contact details page heading is correct', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();

        await expect(page.getByRole('heading', { name: 'Check your contact details', level: 1 })).toBeVisible();
        expect(await checkContactDetailsPage.isDisplayed()).toBeTruthy();
    });

    test('Check contact details page displays the updated contact details', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const originalFirstName = (await profileSettingsPage.getContactDetailValue('First name')).trim();
        const originalLastName = (await profileSettingsPage.getContactDetailValue('Last name')).trim();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();

        const firstName = await checkContactDetailsPage.getContactDetailValue('First name');
        const lastName = await checkContactDetailsPage.getContactDetailValue('Last name');
        expect(firstName.trim()).toBe(originalFirstName);
        expect(lastName.trim()).toBe(originalLastName);
    });

    test('Back button on Check contact details page returns to Change contact details page without saving', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();
        const returnedChangePage = await checkContactDetailsPage.clickBack();

        expect(await returnedChangePage.isDisplayed()).toBeTruthy();
    });

    test('Confirm and save navigates to the confirmation page', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();
        const confirmationPage = await checkContactDetailsPage.clickConfirmAndSave();

        expect(await confirmationPage.isDisplayed()).toBeTruthy();
        await expect(page).toHaveURL(/.*profile#ContactDetailsUpdated/);
    });
});

test.describe('Contact Details Updated Confirmation Page', () => {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
    });

    test('Confirmation panel displays the correct message', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();
        const confirmationPage = await checkContactDetailsPage.clickConfirmAndSave();

        const message = await confirmationPage.getConfirmationMessage();
        expect(message).toContain('Your updated contact details have been saved');
    });

    test('Return to home button navigates to the service home page', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        const profileSettingsPage = await homePage.clickProfileSettings();
        const changeContactDetailsPage = await profileSettingsPage.clickChangeFirstName();
        const checkContactDetailsPage = await changeContactDetailsPage.clickSaveAndContinue();
        const confirmationPage = await checkContactDetailsPage.clickConfirmAndSave();
        const returnedHomePage = await confirmationPage.clickReturnToHome();

        expect(await returnedHomePage.isDisplayed()).toBeTruthy();
        await expect(page).toHaveURL(/.*landing-page/);
    });
});
