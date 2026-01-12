import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class LandingPage {
    private readonly page: Page;
    private readonly headingMessage: Locator;;

    constructor(page: Page) {
        this.page = page;
        this.headingMessage = this.page.getByText('Search the non-compliant properties');
    }

    // Wait for the Compliance Landing page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Compliance Landing Page',
            {
                headingMessage: this.headingMessage
            },
            60000);
    }
}