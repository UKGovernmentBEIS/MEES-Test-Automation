import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
    private readonly pageContext: Locator;
    private readonly backButton: Locator;
    private readonly signOutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.backButton = page.getByRole('link', { name: 'Back', exact: true });
        this.signOutButton = page.getByRole('link', { name: 'Sign out' });
    }

    // Wait for the Compliance Landing page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Compliance Landing Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
                backButton: this.backButton,
                signOutButton: this.signOutButton
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }
}