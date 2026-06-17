import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { SupportWhatDoYouWantPage } from './SupportWhatDoYouWantPage';
import { SupportWhoAreYouPage } from './SupportWhoAreYouPage';

export type ContactFormFields = 'First name' | 'Last name' | 'Your email address' | 'Confirm your email address';
export type ContactFormErrorMessages = 'Enter a first name' | 'Enter a last name' | 'Enter a valid email address';

export class SupportContactFormPage extends BaseCompliancePage {
    private pageContext: Locator;
    private continueButton: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
    }

    // Wait for the Support Contact Form page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Contact Form Page', {
            pageContext: this.pageContext,
            firstNameField: this.page.getByLabel('First name', { exact: true }),
            lastNameField: this.page.getByLabel('Last name', { exact: true }),
            emailField: this.page.getByLabel('Your email address', { exact: true }),
            confirmEmailField: this.page.getByLabel('Confirm your email address', { exact: true }),
            continueButton: this.continueButton
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() &&
            await this.page.getByLabel('First name', { exact: true }).isVisible() &&
            await this.page.getByLabel('Last name', { exact: true }).isVisible() &&
            await this.page.getByLabel('Your email address', { exact: true }).isVisible() &&
            await this.page.getByLabel('Confirm your email address', { exact: true }).isVisible() &&
            await this.continueButton.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async fillContactFormField(fieldName: ContactFormFields, value: string): Promise<void> {
        const field = this.page.getByLabel(fieldName, { exact: true });
        await field.click();
        await field.pressSequentially(value);
    }

    async clickContinueButton(): Promise<SupportWhatDoYouWantPage> {
        await this.continueButton.click();
        return new SupportWhatDoYouWantPage(this.page);
    }

    async clickBackToSupportWhoAreYouButton(): Promise<SupportWhoAreYouPage> {
        const backButton = this.page.getByRole('link', { name: 'Back', exact: true });
        await backButton.click();
        return new SupportWhoAreYouPage(this.page);
    }

    getFieldErrorMessage(fieldName: ContactFormErrorMessages): Locator {
        return this.page.locator('.govuk-error-message', { hasText: `${fieldName}` }).first();
    }
}   