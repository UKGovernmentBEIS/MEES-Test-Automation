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

    test('Verify that the correct template file name is downloaded', async () => {
        const expectedTemplateFileNames: string[] = [
            'Penalty notice letter (publication) template.docx', 
            'Penalty notice letter (finantial) template.docx',
            'Compliance notice letter template.docx',
            'Penalty notice letter (publication and publication) template.docx'
        ];

        const actualFileNames = await templatesPage.downloadFileNamesForTemplates();
        
        // Check that we have the expected number of files
        expect(actualFileNames).toHaveLength(expectedTemplateFileNames.length);
        
        // Check each filename is in the expected list
        actualFileNames.forEach(filename => {
            expect(expectedTemplateFileNames).toContain(filename);
        });
    });
});