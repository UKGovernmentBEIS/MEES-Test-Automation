import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';
import path from 'path';
import fs from 'fs';

test.describe('Login Process Non-Functional Tests', () => {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.ACCESSIBILITY),
            TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
        );
    });

    test('One Login SignIn or Create Account Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_SIGNIN_OR_CREATE_ACCOUNT));
        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();

        // Verify accessibility on the One Login home page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login home page
        const contextLocatorArray = signInOrCreatePage.getContextLocators();
        for (let i = 0; i < contextLocatorArray.length; i++) {
            const locator = contextLocatorArray[i];
            await expect(locator).toHaveScreenshot(`one-login-signin-or-create-account-page-${i}.png`);
        }
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_EMAIL));

        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();

        // Verify accessibility on the One Login enter email page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter email page
        const contextLocatorArray = loginEmailPage.getContextLocators();
        for (let i = 0; i < contextLocatorArray.length; i++) {
            const locator = contextLocatorArray[i];
            await expect(locator).toHaveScreenshot(`one-login-enter-email-page-${i}.png`);
        }
    });

    test('One Login Enter Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_PASSWORD));

        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accountsConfig = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;
        
        // Resolve environment variables for the account credentials
        const email = process.env[accountsConfig[0].email];
        if (!email) {
            throw new Error(`Environment variable ${accountsConfig[0].email} is not set`);
        }

        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        const loginPasswordPage = await loginEmailPage.enterEmailAndContinue(email);

        // Verify accessibility on the One Login enter password page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);

        // Context Verification: Verify presence of key elements on the One Login enter password page
        const contextLocatorArray = loginPasswordPage.getContextLocators();
        for (let i = 0; i < contextLocatorArray.length; i++) {
            const locator = contextLocatorArray[i];
            await expect(locator).toHaveScreenshot(`one-login-enter-password-page-${i}.png`);
        }
    });
});