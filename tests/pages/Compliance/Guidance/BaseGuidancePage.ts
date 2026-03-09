import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { HomePage } from '../HomePage';
import { GuidanceMainPage } from './GuidanceMainPage';

export abstract class BaseGuidancePage extends BaseCompliancePage {
    protected readonly breadcrumbHome: Locator
    protected readonly breadcrumbGuidance: Locator;
    protected readonly pageTitle: Locator
    protected readonly pageContext: Locator;

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbGuidance = page.getByLabel('Breadcrumb').getByRole('link', { name: 'Guidance' });
        this.pageTitle = page.getByRole('heading', { name: 'Guidance' });
        this.pageContext = page.locator('#main-content');
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        // Only wait for breadcrumbs since individual template pages have different titles
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Base Guidance Page',
            { breadcrumbHome: this.breadcrumbHome, breadcrumbGuidance: this.breadcrumbGuidance });
    }

    async isDisplayed(): Promise<boolean> {
        // Check URL contains guidance and breadcrumbs are visible
        return this.page.url().includes('guidance') && 
               await this.breadcrumbHome.isVisible() &&
               await this.breadcrumbGuidance.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Create an array of locators that represent the context of the page, such as the breadcrumb, page title, and main content
        const contextLocators: Locator[] = [this.pageContext];
        return contextLocators;
    }

    async clickHomeBreadcrumb(): Promise<HomePage> {
        await this.breadcrumbHome.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async clickGuidanceBreadcrumb(): Promise<GuidanceMainPage> {
        await this.breadcrumbGuidance.click();
        const guidanceMainPage = new GuidanceMainPage(this.page);
        await guidanceMainPage.waitForPageToLoad();
        return guidanceMainPage;
    }
}