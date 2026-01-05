import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class LandingPage {
    private readonly page: Page;
    private readonly headingMessage: Locator;;

    constructor(page: Page) {
        this.page = page;
        this.headingMessage = this.page.getByText('Search the non-compliant properties');
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Compliance Landing Page',
            {
                headingMessage: this.headingMessage
            }
        );
    }
}