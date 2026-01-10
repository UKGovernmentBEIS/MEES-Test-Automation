import { test, expect } from '@playwright/test';
import { TestAnnotations, PageName, TestType } from '../../utils/TestTypes.ts';
import { HomePage } from '../../pages/HomePage.ts';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import path from 'path';
import fs from 'fs';
import { SignUpEmailPage } from '../../pages/Login/SignUpEmailPage.ts';

test.describe('Registration Pages Tests', () => {
    let signUpEmailPage: SignUpEmailPage;

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
        signUpEmailPage = await signInOrCreatePage.clickCreateAnAccountLink();
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_ENTER_EMAIL_REGISTRATION));

        // Verify accessibility of One Login Enter Email Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
        
        // Context Verification: Verify presence of key elements on the One Login enter email page
        await expect(signUpEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Mandatory Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_MANDATORY_EMAIL_REGISTRATION_ERROR));

        // Click Continue without entering an email to trigger the error
        await signUpEmailPage.clickContinue();

        // Verify accessibility of One Login Mandatory Email Error Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login mandatory email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Mandatory Email Error Page
        await expect(signUpEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Invalid Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_INVALID_EMAIL_REGISTRATION_ERROR));

        // Enter an invalid email and submit to trigger the error
        await signUpEmailPage.enterEmail('invalid-email-format');
        await signUpEmailPage.clickContinue();

        // Verify accessibility of One Login Invalid Email Error Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login invalid email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Invalid Email Error Page
        await expect(signUpEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Check Your Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_CHECK_YOUR_EMAIL_REGISTRATION));

        // Load test account credentials
        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;
        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email];
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        // Enter a test email and submit to navigate to Check Your Email Page
        const checkYourEmailPage = await signUpEmailPage.enterEmailAndContinue(email);

        // Verify accessibility of One Login Check Your Email Page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = await AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login Check Your Email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login Check Your Email Page
        await expect(checkYourEmailPage.pageContext).toMatchAriaSnapshot();
    });
});
