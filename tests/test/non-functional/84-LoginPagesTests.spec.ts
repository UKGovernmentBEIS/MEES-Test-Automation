import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import path from 'path';
import fs from 'fs';

test.describe('Login Process Non-Functional Tests', () => {
    let landingPage: LandingPage;
    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY),
            TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
        );

        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test('One Login SignIn or Create Account Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_SIGNIN_OR_CREATE_ACCOUNT));
        
        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();

        // Verify accessibility on the One Login home page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login home page
        await expect(signInOrCreatePage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_ENTER_EMAIL));

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const logInEmailPage = await signInOrCreatePage.clickSignIn();

        // Verify accessibility on the One Login enter email page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter email page
        await expect(logInEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Enter Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_ENTER_PASSWORD));

        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;
        
        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email];
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);

        // Verify accessibility on the One Login enter password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter password page
        await expect(loginPasswordPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Mandatory Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_MANDATORY_EMAIL_ERROR));

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        // Leave email blank and click continue
        await loginEmailPage.clickContinue();

        // Verify accessibility on the One Login mandatory email error page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login mandatory email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login mandatory email error page
        await expect(loginEmailPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Invalid Email Error Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_INVALID_EMAIL_ERROR));

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        await loginEmailPage.enterEmail('invalid-email');
        await loginEmailPage.clickContinue();

        // Verify accessibility on the One Login invalid email error page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login invalid email error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login invalid email error page
        await expect(loginEmailPage.pageContext).toMatchAriaSnapshot();
    });

    // Skipped until tests are executed less freequently to avoind locking the test account due to multiple failed login attempts. This will allow us to verify the error handling and accessibility of the page when password is missing.
    test.skip('One Login Missing Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_MISSING_PASSWORD_ERROR));

        // Load test account credentials
        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;
        
        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email];
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        // Leave password blank and click continue
        await loginPasswordPage.clickContinue();

        // Verify accessibility on the One Login enter password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter password page
        await expect(loginPasswordPage.pageContext).toMatchAriaSnapshot();
    });
    
    test('One Login Invalid Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_INVALID_PASSWORD_ERROR));

        // Load test account credentials
        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email]; 
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        await loginPasswordPage.enterPassword('InvalidPassword123!');
        await loginPasswordPage.clickContinue();

        // Verify accessibility on the One Login invalid password error page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login invalid password error page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login invalid password error page
        await expect(loginPasswordPage.pageContext).toMatchAriaSnapshot();
    });

    test('One Login Forgotten Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_FORGOTTEN_PASSWORD));

        // Load test account credentials
        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email]; 
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);
        const forgottenPasswordPage = await loginPasswordPage.clickForgotPasswordLink();

        // Verify accessibility on the One Login forgotten password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login forgotten password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login forgotten password page
        // Use template literal to inject the email into the snapshot
        await expect(forgottenPasswordPage.pageContext).toMatchAriaSnapshot(`- main:
            - heading "Check your email" [level=1]
            - paragraph: We need to make sure this is your GOV.UK One Login before you can reset your password.
            - paragraph
            - text: "We have sent an email to: ${email}"
            - paragraph
            - paragraph: The email contains a 6 digit security code.
            - paragraph: Your email might take a few minutes to arrive. If you do not get an email, check your spam folder.
            - text: Enter the 6 digit code
            - textbox "Enter the 6 digit code"
            - group: Problems with the code?
            - button "Continue"`);
    });

    test('One Login Account Not Found Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_ACCOUNT_NOT_FOUND));

        const signInOrCreatePage = await landingPage.clickSignIn_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const accountNotFoundPage = await loginEmailPage.enterEmailAndContinueToAccountNotFoundPage('test@test.com');

        // Verify accessibility on the One Login account not found page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login account not found page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login account not found page
        await expect(accountNotFoundPage.pageContext).toMatchAriaSnapshot();
    });
});