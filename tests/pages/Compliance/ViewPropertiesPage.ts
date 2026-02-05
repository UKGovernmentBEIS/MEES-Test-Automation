import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';

export class ViewPropertiesPage extends BaseCompliancePage {

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
    }

    // Wait for the View Properties page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'View Properties Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
            });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }
}