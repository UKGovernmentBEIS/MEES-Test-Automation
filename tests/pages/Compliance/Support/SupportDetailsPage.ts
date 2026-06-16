import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';

export class SupportDetailsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private continueButton: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
    }

    // Wait for the Support Details page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Details Page', {
            pageContext: this.pageContext
        });
    }

    async isDisplayed(): Promise<boolean> {
        return this.pageContext.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickContinueButton(): Promise<void> {
        await this.continueButton.click();
    }
}