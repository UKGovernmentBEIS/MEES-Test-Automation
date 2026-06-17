import { expect, test } from '../../fixtures/authFixtures';
import { HomePage } from '../../pages/Compliance/HomePage';
import { BaseCompliancePage } from '../../pages/Compliance/BaseCompliancePage';
import { SupportWhoAreYouPage } from '../../pages/Compliance/Support/SupportWhoAreYouPage';
import { LandingPage } from '../../pages/LandingPage';
import { TestAnnotations, TestType } from '../../utils/TestTypes';

test.describe('Page validation tests', () => {
    let supportWhoAreYouPage: SupportWhoAreYouPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
    });

    test('Verify velidation error messages on the Support Who Are You page when no option is selected', async ({ page }) => {
        await supportWhoAreYouPage.clickContinueButton();
        expect(await supportWhoAreYouPage.getErrorSummary()).toBeVisible();
        expect(await supportWhoAreYouPage.getErrorSelectOption()).toBeVisible();
    });

    test('Verify validation error messages on the Support Contact Form page when required fields are left empty', async ({ page }) => {
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        expect(await supportContactFormPage.isDisplayed()).toBe(true);

        await supportContactFormPage.clickContinueButton();
        const errorSummary = supportContactFormPage.getErrorSummary();
        expect(await errorSummary.isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a first name').isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a last name').isVisible()).toBe(true);
        expect(await supportContactFormPage.getFieldErrorMessage('Enter a valid email address').isVisible()).toBe(true);
    });

    test('Verify validation error messages on the Support What Do You Want page when no option is selected', async ({ page }) => {
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        expect(await supportContactFormPage.isDisplayed()).toBe(true);

        await supportContactFormPage.fillContactFormField('First name', 'John');
        await supportContactFormPage.fillContactFormField('Last name', 'Doe');
        await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();
        expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);

        await supportWhatDoYouWantPage.clickContinueButton();
        expect(await supportWhatDoYouWantPage.getMissingOptionError().isVisible()).toBe(true);
    });

    test('Verify validation error messages on the Support Details page when the details field is left empty', async ({ page }) => {
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        expect(await supportContactFormPage.isDisplayed()).toBe(true);

        // Fill in the contact form fields
        await supportContactFormPage.fillContactFormField('First name', 'John');
        await supportContactFormPage.fillContactFormField('Last name', 'Doe');
        await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');

        // Click the continue button to proceed to the Support What Do You Want page
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();
        expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);

        // Select a support option and proceed to the Support Details page
        await supportWhatDoYouWantPage.selectHelpRequestOption('I have a question about the policy or guidance');
        const supportDetailsPage = await supportWhatDoYouWantPage.clickContinueButton();
        await supportDetailsPage.waitForPageToLoad();
        expect(await supportDetailsPage.isDisplayed()).toBe(true);

        // Click the submit button without entering any details
        await supportDetailsPage.clickSubmitButton();
        expect(await supportDetailsPage.getErrorSummary().isVisible()).toBe(true);
        expect(await supportDetailsPage.getErrorDetailsTextArea().isVisible()).toBe(true);
    });
});

test.describe('Support Process tests', () => {
    let supportWhoAreYouPage: SupportWhoAreYouPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        supportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
    });

    const testCases = [
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'I have a question about the policy or guidance'},
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'I need an account created'},
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'I cannot log in to my account'},
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'Something has gone wrong with the service'},
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'I need to change my permission levels'},
        { role: 'Department for Energy Security and Net Zero official', supportOption: 'Other'},
        { role: 'Local authority user', supportOption: 'I have a question about the policy or guidance'},
        { role: 'Local authority user', supportOption: 'I need an account created'},
        { role: 'Local authority user', supportOption: 'I cannot log in to my account'},
        { role: 'Local authority user', supportOption: 'Something has gone wrong with the service'},
        { role: 'Local authority user', supportOption: 'I need to change my permission levels'},
        { role: 'Local authority user', supportOption: 'Other'}
    ]

    testCases.forEach(({ role, supportOption }) => {
        test(`Verify that the Support process works correctly for role: ${role} and support option: ${supportOption}`, async () => {
            
            // Select the role and proceed to the Support Contact Form page
            await supportWhoAreYouPage.selectRole(role);
            const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
            await supportContactFormPage.waitForPageToLoad();
            expect(await supportContactFormPage.isDisplayed()).toBe(true);

            // Fill in the contact form fields
            await supportContactFormPage.fillContactFormField('First name', 'John');
            await supportContactFormPage.fillContactFormField('Last name', 'Doe');
            await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
            await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');

            // Click the continue button to proceed to the next page
            const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
            await supportWhatDoYouWantPage.waitForPageToLoad();
            expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);

            // Select the support option and proceed to the Support Details page
            await supportWhatDoYouWantPage.selectHelpRequestOption(supportOption as any);
            const supportDetailsPage = await supportWhatDoYouWantPage.clickContinueButton();
            await supportDetailsPage.waitForPageToLoad();
            expect(await supportDetailsPage.isDisplayed()).toBe(true);

            // Enter support details and submit the form
            await supportDetailsPage.enterSupportDetails('This is a test support request.');
            const supportSubmittedPage = await supportDetailsPage.clickSubmitButton();
            if (supportOption === 'I need an account created') {
                // Bug 1062 For the "I need an account created" option, we expect to see an error message
                expect(await supportSubmittedPage.isDisplayed()).toBe(false);
            } else {
                // For other options, we expect to reach the Support Submitted page
                await supportSubmittedPage.waitForPageToLoad();
                expect(await supportSubmittedPage.isDisplayed()).toBe(true);
            }
        });
    });
});

test.describe('Navigation tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        homePage = await landingPage.clickSignIn_AuthenticatedUser();
    });

    test('Verify that the user can navigate back to the Home page from the Support Who Are You page', async () => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        const homePageFromSupport = await supportWhoAreYouPage.clickBackToHomePageButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });

    test('Verify that the user can navigate back to the Home page from the Support Contact Form page', async () => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        const supportWhoAreYouPageFromContactForm = await supportContactFormPage.clickBackToSupportWhoAreYouButton();
        await supportWhoAreYouPageFromContactForm.waitForPageToLoad();
        const homePageFromSupport = await supportWhoAreYouPageFromContactForm.clickBackToHomePageButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });

    test('Verify that the user can navigate back to the Home page from the Support What Do You Want page', async () => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        await supportContactFormPage.fillContactFormField('First name', 'John');
        await supportContactFormPage.fillContactFormField('Last name', 'Doe');
        await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');

        // Click the continue button to proceed to the next page
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();
        expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);
    });

    test('Verify that the user can navigate back to the Home page from the Support Details page', async () => {
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();
        await supportContactFormPage.fillContactFormField('First name', 'John');
        await supportContactFormPage.fillContactFormField('Last name', 'Doe');
        await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');

        // Click the continue button to proceed to the next page
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();
        expect(await supportWhatDoYouWantPage.isDisplayed()).toBe(true);

        // Select the support option and proceed to the Support Details page
        await supportWhatDoYouWantPage.selectHelpRequestOption('I have a question about the policy or guidance');
        const supportDetailsPage = await supportWhatDoYouWantPage.clickContinueButton();
        await supportDetailsPage.waitForPageToLoad();
        expect(await supportDetailsPage.isDisplayed()).toBe(true);

        // Navigate back to the Support What Do You Want page
        const supportWhatDoYouWantPageFromDetails = await supportDetailsPage.clickBackToSupportWhatDoYouWantButton();
        await supportWhatDoYouWantPageFromDetails.waitForPageToLoad();
        expect(await supportWhatDoYouWantPageFromDetails.isDisplayed()).toBe(true);

        // Navigate back to the Support Contact Form page
        const supportContactFormPageFromWhatDoYouWant = await supportWhatDoYouWantPageFromDetails.clickBackToSupportContactFormButton();
        await supportContactFormPageFromWhatDoYouWant.waitForPageToLoad();
        expect(await supportContactFormPageFromWhatDoYouWant.isDisplayed()).toBe(true);

        // Navigate back to the Support Who Are You page
        const supportWhoAreYouPageFromContactForm = await supportContactFormPageFromWhatDoYouWant.clickBackToSupportWhoAreYouButton();
        await supportWhoAreYouPageFromContactForm.waitForPageToLoad();
        expect(await supportWhoAreYouPageFromContactForm.isDisplayed()).toBe(true);

        // Navigate back to the Home page
        const homePageFromSupport = await supportWhoAreYouPageFromContactForm.clickBackToHomePageButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });

    test('Verify that the user can navigate back to the Home page from the Support Submitted page', async () => {
        // Navigate to the Support Submitted page
        const supportWhoAreYouPage: SupportWhoAreYouPage = await homePage.clickRequestSupportLink();

        // Select the role and proceed to the Support Contact Form page
        await supportWhoAreYouPage.waitForPageToLoad();
        await supportWhoAreYouPage.selectRole('Department for Energy Security and Net Zero official');
        const supportContactFormPage = await supportWhoAreYouPage.clickContinueButton();
        await supportContactFormPage.waitForPageToLoad();

        // Fill in the contact form fields and proceed to the Support What Do You Want page
        await supportContactFormPage.fillContactFormField('First name', 'John');
        await supportContactFormPage.fillContactFormField('Last name', 'Doe');
        await supportContactFormPage.fillContactFormField('Your email address', 'john.doe@example.com');
        await supportContactFormPage.fillContactFormField('Confirm your email address', 'john.doe@example.com');
        const supportWhatDoYouWantPage = await supportContactFormPage.clickContinueButton();
        await supportWhatDoYouWantPage.waitForPageToLoad();

        // Select the support option and proceed to the Support Details page
        await supportWhatDoYouWantPage.selectHelpRequestOption('I have a question about the policy or guidance');
        const supportDetailsPage = await supportWhatDoYouWantPage.clickContinueButton();
        await supportDetailsPage.waitForPageToLoad();

        // Enter support details and submit the form to reach the Support Submitted page
        await supportDetailsPage.enterSupportDetails('This is a test support request.');
        const supportSubmittedPage = await supportDetailsPage.clickSubmitButton();
        await supportSubmittedPage.waitForPageToLoad();
        
        // Navigate back to the Home page from the Support Submitted page
        const homePageFromSupport = await supportSubmittedPage.clickReturnHomeButton();
        await homePageFromSupport.waitForPageToLoad();
        expect(await homePageFromSupport.isDisplayed()).toBe(true);
    });
});

test.describe('Support link availability across pages', () => {

    test.beforeEach(async ({}, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );
    });

    // The "Help" link in the footer is on every compliance page (inherited from BaseCompliancePage)
    // and should reach the Support page from each of them.
    const pages: { name: string; goTo: (homePage: HomePage) => Promise<BaseCompliancePage> }[] = [
        { name: 'Home', goTo: async (homePage) => homePage },
        { name: 'Property records', goTo: async (homePage) => homePage.clickOnPropertyRecordsTab() },
        { name: 'Guidance', goTo: async (homePage) => homePage.clickGuidanceLink() },
        { name: 'Templates', goTo: async (homePage) => homePage.clickViewTemplates() },
        { name: 'Penalty calculator', goTo: async (homePage) => homePage.clickOnPenaltyCalculatorTab() },
        { name: 'Profile settings', goTo: async (homePage) => homePage.clickProfileSettings() },
        {
            name: 'View properties',
            goTo: async (homePage) => {
                const filterPropertiesPage = await homePage.clickOnPropertyRecordsTab();
                await filterPropertiesPage.setEnergyRatingFilter('A');
                await filterPropertiesPage.selectEvidenceFoundRentalEvidence();
                const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
                await viewPropertiesPage.waitForTableContent();
                return viewPropertiesPage;
            }
        },
        {
            name: 'Property details',
            goTo: async (homePage) => {
                const filterPropertiesPage = await homePage.clickOnPropertyRecordsTab();
                await filterPropertiesPage.setEnergyRatingFilter('A');
                await filterPropertiesPage.selectEvidenceFoundRentalEvidence();
                const viewPropertiesPage = await filterPropertiesPage.clickApplyFilters();
                await viewPropertiesPage.waitForTableContent();
                return viewPropertiesPage.ViewDetailsForPropertyWithAddress('Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL');
            }
        }
    ];

    pages.forEach(({ name, goTo }) => {
        test(`Footer Help link navigates to the Support page from the ${name} page`, async ({ page }) => {
            const landingPage = new LandingPage(page);
            await landingPage.navigate();
            const homePage = await landingPage.clickSignIn_AuthenticatedUser();

            const currentPage = await goTo(homePage);
            expect(await currentPage.isDisplayed(),
                `Expected to be on the ${name} page before clicking the footer Help link`).toBe(true);

            const supportWhoAreYouPage = await currentPage.clickFooterHelpLink();
            expect(await supportWhoAreYouPage.isDisplayed(),
                `Footer Help link from the ${name} page did not navigate to the Support page`).toBe(true);
        });
    });
});