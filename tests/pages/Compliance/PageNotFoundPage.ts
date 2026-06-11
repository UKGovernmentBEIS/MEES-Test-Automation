import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';

export class PageNotFoundPage extends BaseCompliancePage {
    private pageContext: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('.govuk-grid-column-two-thirds');
    }

    // Wait for the Page Not Found page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        await this.pageContext.waitFor({ state: 'visible', timeout: 60000 });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('page-not-found');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }
}