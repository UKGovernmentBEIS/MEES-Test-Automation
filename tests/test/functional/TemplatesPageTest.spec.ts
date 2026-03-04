import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { TemplatesPage } from '../../pages/Compliance/TemplatesPage';

test.describe('Penalty Calculator Page', () => {
    let templatesPage: TemplatesPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        templatesPage = await homePage.clickViewTemplates();
    });

    test('Templates page should load successfully', async () => {
        expect(await templatesPage.isDisplayed()).toBe(true);
    });

    test('Templates page displays correct publisher information link', async () => {
        const publisherInfoLink = await templatesPage.getPublisherInformationLink();
        // Bug: 755 - The publisher information link is incorrect'
        expect(publisherInfoLink).toBe('#-55');
    });
});