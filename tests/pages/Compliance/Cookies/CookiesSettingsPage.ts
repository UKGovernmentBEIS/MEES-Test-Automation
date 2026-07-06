import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';

export class CookiesSettingsPage {
    private readonly page: Page;
    private readonly mainContext: Locator;

    constructor(page: Page) {
        this.page = page;
        this.mainContext = page.locator('#main-content');
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Cookie Settings Page',
            {
                mainContext: this.mainContext,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.mainContext.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.mainContext];
    }
}