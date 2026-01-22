import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { CompliancePageBase } from './ComplianceBasePage';

export class LandingPage extends CompliancePageBase {
    private readonly pageContext: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
    }

    // Wait for the Compliance Landing page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Compliance Landing Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }
}