import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { SupportWhatDoYouWantPage } from './SupportWhatDoYouWantPage';
import { SupportSubmittedPage } from './SupportSubmittedPage';

export class SupportDetailsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private errorSummary: Locator;
    private errorDetailsTextArea: Locator;
    private supportDetailsTextArea: Locator;
    private submitButton: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.errorSummary = page.locator('.govuk-error-summary');
        this.errorDetailsTextArea = page.locator('.govuk-error-message', { hasText: 'Please describe the issue you need support with' });
        this.supportDetailsTextArea = page.locator('textarea');
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    // Wait for the Support Details page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Details Page', {
            pageContext: this.pageContext,
            supportDetailsTextArea: this.supportDetailsTextArea,
            submitButton: this.submitButton
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() &&
            await this.supportDetailsTextArea.isVisible() &&
            await this.submitButton.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickBackToSupportWhatDoYouWantButton(): Promise<SupportWhatDoYouWantPage> {
        const backButton = this.page.getByRole('link', { name: 'Back', exact: true });
        await backButton.click();
        return new SupportWhatDoYouWantPage(this.page);
    }

    getErrorDetailsTextArea(): Locator {
        return this.errorDetailsTextArea;
    }

    getErrorSummary(): Locator {
        return this.errorSummary;
    }

    async enterSupportDetails(details: string): Promise<void> {
        const textarea = this.supportDetailsTextArea;
        await textarea.click();
        await textarea.pressSequentially(details);
    }

    async clickSubmitButton(): Promise<SupportSubmittedPage> {
        await this.submitButton.click();
        return new SupportSubmittedPage(this.page);
    }
}