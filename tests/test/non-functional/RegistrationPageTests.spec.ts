import { test, expect } from '@playwright/test';
import { TestAnnotations, PageName, TestType } from '../../utils/TestTypes.ts';
import { HomePage } from '../../pages/HomePage.ts';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { RegistrationEmailPage } from '../../pages/Login/RegistrationEmailPage.ts';
import path from 'path';
import fs from 'fs';


test.describe('Registration Process Non-Functional Tests', () => {
    let registrationEmailPage: RegistrationEmailPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY),
            TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
        );

        // Navigate to Home Page
        const homePage = new HomePage(page);
        await homePage.navigate();

        // Click on the Start Now button to navigate to Sign In Or Create Account Page
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser(); 

        // Click on the Create an account link to navigate to One Login Enter Email Page
        registrationEmailPage = await signInOrCreatePage.clickCreateAnAccountLink();
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_ENTER_EMAIL_REGISTRATION));

        // Verify accessibility of One Login Enter Email Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
        
        // Context Verification: Verify presence of key elements on the One Login enter email page
        await expect(registrationEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Mandatory Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_MANDATORY_EMAIL_REGISTRATION_ERROR));

        // Click Continue without entering an email to trigger the error
        await registrationEmailPage.clickContinue();

        // Verify accessibility of One Login Mandatory Email Error Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login mandatory email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Mandatory Email Error Page
        await expect(registrationEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Invalid Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_INVALID_EMAIL_REGISTRATION_ERROR));

        // Enter an invalid email and submit to trigger the error
        await registrationEmailPage.enterEmail('invalid-email-format');
        await registrationEmailPage.clickContinue();

        // Verify accessibility of One Login Invalid Email Error Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login invalid email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Invalid Email Error Page
        await expect(registrationEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Check Your Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_CHECK_YOUR_EMAIL_REGISTRATION));

        // Enter a test email and submit to navigate to Check Your Email Page
        const checkYourEmailPage = await registrationEmailPage.enterEmailAndContinue("test@test.com");

        // Verify accessibility of One Login Check Your Email Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login Check Your Email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Check Your Email Page
        await expect(checkYourEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Existing Email Provide Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_EXISTING_EMAIL_REGISTRATION));

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

        // Verify accessibility of One Login Existing Email Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login Existing Email Provide Password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

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
