import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BasePage } from '../BasePage';
import { ViewPropertiesPage } from './ViewPropertiesPage';

export class HomePage extends BasePage {
    private readonly pageContext: Locator;
    private readonly backButton: Locator;
    private readonly signOutButton: Locator;
    private readonly viewPropertiesButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.backButton = page.getByRole('link', { name: 'Back', exact: true });
        this.signOutButton = page.getByRole('link', { name: 'Sign out' });
        this.viewPropertiesButton = page.getByRole('button', { name: 'View property records' });
    }

    // Wait for the Home Page page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Home Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
                viewPropertiesButton: this.viewPropertiesButton,
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

    async clickViewProperties(): Promise<ViewPropertiesPage> {
        await this.viewPropertiesButton.click();
        const viewPropertiesPage = new ViewPropertiesPage(this.page);
        await viewPropertiesPage.waitForPageToLoad();
        return viewPropertiesPage;
    }
}