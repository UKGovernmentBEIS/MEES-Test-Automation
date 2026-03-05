import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';

export class GuidanceMainPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly breadcrumbHome: Locator;
    private readonly pageTitle: Locator;

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.pageTitle = page.getByRole('heading', { name: 'Guidance' });
        this.pageContext = page.locator('#main-content');
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Guidance Main Page',
            { breadcrumbHome: this.breadcrumbHome, pageTitle: this.pageTitle });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('guidance') && await this.pageTitle.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Create an array of locators that represent the context of the page, such as the breadcrumb, page title, and main content
        const contextLocators: Locator[] = 
            [this.breadcrumbHome, this.pageTitle, this.pageContext];
        return contextLocators;
    }
}