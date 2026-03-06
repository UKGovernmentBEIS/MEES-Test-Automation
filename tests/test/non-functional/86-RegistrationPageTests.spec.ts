import { test, expect } from '@playwright/test';
import { PageName } from '../../utils/TestTypes';
import { LandingPage } from '../../pages/LandingPage';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';
import { RegistrationEmailPage } from '../../pages/Login/RegistrationEmailPage.ts';
import path from 'path';
import fs from 'fs';


test.describe('Registration Process Non-Functional Tests', () => {
    let registrationEmailPage: RegistrationEmailPage;

    test.beforeEach(async ({ page }) => {
        // Navigate to Home Page
        const landingPage = new LandingPage(page);
        await landingPage.navigate();

        // Click on the Start Now button to navigate to Sign In Or Create Account Page
        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();

        // Click on the Create an account link to navigate to One Login Enter Email Page
        registrationEmailPage = await signInOrCreatePage.clickCreateAnAccountLink();
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ONE_LOGIN_ENTER_EMAIL_REGISTRATION);

        // Verify accessibility on the One Login Enter Email Page
        await baseTest.verifyAccessibility(PageName.ONE_LOGIN_ENTER_EMAIL_REGISTRATION);

        // Verify page context on the One Login Enter Email Page
        await baseTest.verifyContextWithLocators([registrationEmailPage.pageContext]);
    });

    test('One Login Mandatory Email Error Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ONE_LOGIN_MANDATORY_EMAIL_REGISTRATION_ERROR);

        // Click Continue without entering an email to trigger the error
        await registrationEmailPage.clickContinue();

        // Verify accessibility on the One Login Mandatory Email Error Page
        await baseTest.verifyAccessibility(PageName.ONE_LOGIN_MANDATORY_EMAIL_REGISTRATION_ERROR);

        // Verify page context on the One Login Mandatory Email Error Page
        await baseTest.verifyContextWithLocators([registrationEmailPage.pageContext]);
    });

    test('One Login Invalid Email Error Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ONE_LOGIN_INVALID_EMAIL_REGISTRATION_ERROR);

        // Enter an invalid email and submit to trigger the error
        await registrationEmailPage.enterEmail('invalid-email-format');
        await registrationEmailPage.clickContinue();

        // Verify accessibility on the One Login Invalid Email Error Page
        await baseTest.verifyAccessibility(PageName.ONE_LOGIN_INVALID_EMAIL_REGISTRATION_ERROR);

        // Verify page context on the One Login Invalid Email Error Page
        await baseTest.verifyContextWithLocators([registrationEmailPage.pageContext]);
    });

    test('One Login Check Your Email Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ONE_LOGIN_CHECK_YOUR_EMAIL_REGISTRATION);

        // Enter a test email and submit to navigate to Check Your Email Page
        const checkYourEmailPage = await registrationEmailPage.enterEmailAndContinue("test@test.com");

        // Verify accessibility on the One Login Check Your Email Page
        await baseTest.verifyAccessibility(PageName.ONE_LOGIN_CHECK_YOUR_EMAIL_REGISTRATION);

        // Verify page context on the One Login Check Your Email Page
        await baseTest.verifyContextWithLocators([checkYourEmailPage.pageContext]);
    });

    test('One Login Existing Email Provide Password Page', async ({ page }, testInfo) => {
        const baseTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.ONE_LOGIN_EXISTING_EMAIL_REGISTRATION);

        // Load test account credentials
        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;
        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email];
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        // Enter a already registered email and submit to navigate to Check Your Email Page
        const checkYourEmailPage = await registrationEmailPage.enterEmailAndContinue(email);

        // Context Verification: Verify presence of key elements on the One Login Existing Email Page
        // Use template literal to inject the email into the snapshot
        await expect(checkYourEmailPage.pageContext).toMatchAriaSnapshot(`- main:
  - heading "You have a GOV.UK One Login" [level=1]
  - paragraph: There’s already a GOV.UK One Login using ${email}
  - paragraph: Enter your password to sign in.
  - text: Password
  - textbox "Password"
  - button "Show password": Show
  - text: Your password is hidden
  - button "Continue"
  - paragraph:
    - link "I’ve forgotten my password":
      - /url: /reset-password-request`);
    });
});
