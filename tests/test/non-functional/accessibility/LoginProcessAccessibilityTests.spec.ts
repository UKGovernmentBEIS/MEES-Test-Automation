import { test, expect } from '@playwright/test';
import { HomePage } from '../../../pages/HomePage';
import { AccessibilityUtilities } from '../../../utils/AccessibilityUtilities';
import path from 'path';
import fs from 'fs';

test.describe('Login Accessibility Tests', () => {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push({ type: 'test-type', description: 'Accessibility' });
    });

    test('One Login Home Page', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();
        await homePage.clickStartNow_NotAuthenticatedUser();

        const results = await AccessibilityUtilities.analyzeAccessibility(page);

        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login home page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
    });

    test('One Login Enter Email Page', async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();
        const signInOrCreatePage = await homePage.clickStartNow_NotAuthenticatedUser();
        await signInOrCreatePage.clickSignIn();

        const results = await AccessibilityUtilities.analyzeAccessibility(page);

        const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
        expect(criticalViolations, `One Login enter email page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
    });

    test('One Login Enter Password Page', async ({ page }) => {
        const accountsPath = path.join(__dirname, '../../../config/test-accounts.json');
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