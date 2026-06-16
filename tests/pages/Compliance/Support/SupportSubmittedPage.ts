import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';

export class SupportSubmittedPage extends BaseCompliancePage {
    private pageContext: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
    }

    // Wait for the Support Submitted page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Submitted Page', {
            pageContext: this.pageContext
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }
}