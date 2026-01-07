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

    test('One Login Home Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_HOME));
        const homePage = new HomePage(page);
        await homePage.navigate();
        await homePage.clickStartNow_NotAuthenticatedUser();

        // Verify accessibility on the One Login home page
        const results = await AccessibilityUtilities.analyzeAccessibility(page);
        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
    });

    test('One Login Enter Email Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_EMAIL));

        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        await signInOrCreatePage.clickSignIn();

        const results = await AccessibilityUtilities.analyzeAccessibility(page);

        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
    });

    test('One Login Enter Password Page', async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.page(PageName.ONE_LOGIN_PASSWORD));

        const accountsPath = path.join(__dirname, '../../config/test-accounts.json');
        const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8')).accounts;

        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        const loginEmailPage = await signInOrCreatePage.clickSignIn();
        await loginEmailPage.enterEmailAndContinue(accounts[0].email);

        const results = await AccessibilityUtilities.analyzeAccessibility(page);

        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter password page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
    });
});