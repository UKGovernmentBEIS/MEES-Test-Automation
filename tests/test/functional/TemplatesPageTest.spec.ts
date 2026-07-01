import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { TemplatesPage } from '../../pages/Compliance/TemplatesPage';

test.describe('Templates Page', () => {
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

    test('Verify that the correct template file name is downloaded', async () => {
        const expectedTemplateFileNames: string[] = [
            'Penalty notice letter (publication) template - V1.docx',
            'Penalty notice letter (financial) template - V1.docx',
            'Compliance notice letter template - V1.docx',
            'Penalty notice letter (financial and publication) template - V1.docx'
        ];

        const actualFileNames = await templatesPage.downloadFileNamesForTemplates();
        
        // Check that we have the expected number of files
        expect(actualFileNames).toHaveLength(expectedTemplateFileNames.length);
        
        // Check each expected filename is present in the actual downloaded files
        expectedTemplateFileNames.forEach(filename => {
            expect(actualFileNames).toContain(filename);
        });
    });

    test('Verify each template name displays a version number in the UI', async () => {
        const names = await templatesPage.getTemplateDisplayNames();

        // There should be at least one template listed
        expect(names.length).toBeGreaterThan(0);

        // Each on-screen template name must carry a version suffix (e.g. "- V1") for audit trails.
        // Matched version-number-agnostically so revised templates (- V2, - V3 …) still pass.
        names.forEach(name => {
            expect(name, `Template "${name}" should show a version suffix (e.g. - V1)`).toMatch(/- ?V\d+$/);
        });
    });

    test('Should navigate to Home page when clicking page header link', async () => {
        const homePage = await templatesPage.clickPageHeaderLink();
        expect(await homePage.isDisplayed()).toBe(true);
    });
});