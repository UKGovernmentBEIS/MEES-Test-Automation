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

    test('Registration link opens Microsoft Forms in a new tab', async () => {
        expect(await landingPage.getRegistrationLinkHref()).toBe('https://forms.office.com/Pages/ResponsePage.aspx?id=BXCsy8EC60O0l-ZJLRst2JQXK8_FFYZPtmqEfq-y_YNUOUVMNDFRSjI5SjVaVDRJVkExN003SzlDSS4u');
        expect(await landingPage.registrationLinkOpensInNewTab()).toBe(true);
    });

    test('Request support link navigates to the support form', async () => {
        const href = await landingPage.getRequestSupportLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
    });

    test('"Review exemptions for private rented sector energy standards" related link navigates correctly', async () => {
        const href = await landingPage.getReviewExemptionsLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
    });

    test('"Find an energy certificate" related link navigates correctly', async () => {
        const href = await landingPage.getFindEnergyCertificateLinkHref();
        expect(href).not.toBe('#');
        expect(href).not.toBeNull();
    });
});
