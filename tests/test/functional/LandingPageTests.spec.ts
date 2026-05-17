import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';

test.describe('Landing Page', () => {
    let landingPage: LandingPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(TestAnnotations.testType(TestType.FUNCTIONAL));
        landingPage = new LandingPage(page);
        await landingPage.navigate();
    });

    test.skip('Registration link opens Microsoft Forms in a new tab', async ({ page }) => {
        expect(await landingPage.getRegistrationLinkHref()).toBe('https://forms.office.com/e/1e9mQDGXvH');
        expect(await landingPage.registrationLinkOpensInNewTab()).toBe(true);
    });

    // Unskip once the real support form URL is confirmed with the developer
    test.skip('Request support link navigates to the support form', async ({ page }) => {
        const href = await landingPage.getRequestSupportLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
        await landingPage.clickRequestSupportLink();
        await page.waitForLoadState('networkidle');
        expect(page.url()).not.toBe(page.url().split('#')[0] + '#');
    });

    // Unskip once developer implements the related links
    test.skip('"Review exemptions for private rented sector energy standards" related link navigates correctly', async ({ page }) => {
        const href = await landingPage.getReviewExemptionsLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
    });

    // Unskip once developer implements the related links
    test.skip('"Find an energy certificate" related link navigates correctly', async ({ page }) => {
        const href = await landingPage.getFindEnergyCertificateLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
    });
});
