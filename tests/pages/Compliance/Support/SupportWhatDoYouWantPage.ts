import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { SupportDetailsPage } from './SupportDetailsPage';
import { SupportContactFormPage } from './SupportContactFormPage';

export type HelpRequestOptions = 
    'I have a question about the policy or guidance' | 
    'I need an account created' | 
    'I cannot log in to my account' |
    'Something has gone wrong with the service' |
    'I need to change my permission levels' |
    'Other';

export class SupportWhatDoYouWantPage extends BaseCompliancePage {
    private pageContext: Locator;
    private continueButton: Locator;
    private missingOptionError: Locator;
    private backButton: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.backButton = page.getByRole('link', { name: 'Back', exact: true });
        this.pageContext = page.locator('#main-content');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.missingOptionError = page.locator('.govuk-error-message', { hasText: 'Please select what you need support with' });
    }

    // Wait for the Support What Do You Want page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support What Do You Want Page', {
            pageContext: this.pageContext,
            supportOptions: this.page.getByLabel('I have a question about the policy or guidance', { exact: true })
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() &&
            await this.page.getByLabel('I have a question about the policy or guidance', { exact: true }).isVisible()
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickBackToSupportContactFormButton(): Promise<SupportContactFormPage> {
        await this.backButton.click();
        return new SupportContactFormPage(this.page);
    }

    async clickContinueButton(): Promise<SupportDetailsPage> {
        await this.continueButton.click();
        return new SupportDetailsPage(this.page);
    }

    async selectHelpRequestOption(option: HelpRequestOptions): Promise<void> {
        const optionLocator = this.page.getByLabel(option, { exact: true });
        await optionLocator.check();
    }

    getMissingOptionError(): Locator {
        return this.missingOptionError;
    }
}