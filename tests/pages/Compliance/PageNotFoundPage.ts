import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class PageNotFoundPage {
    private pageContext: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.pageContext = page.locator('#main-content');
    }

    // Wait for the Page Not Found page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Page Not Found Page', {
            pageContext: this.pageContext
        });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('page-not-found');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }
}