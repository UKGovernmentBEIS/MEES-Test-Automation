import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';

export class SupportWhoAreYouPage {
    private pageContext: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.pageContext = page.locator('#main-content');
    }

    // Wait for the Support Who Are You page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Who Are You Page', {
            pageContext: this.pageContext
        });
    }

    async isDisplayed(): Promise<boolean> {
        return this.pageContext.isVisible();
    }
}