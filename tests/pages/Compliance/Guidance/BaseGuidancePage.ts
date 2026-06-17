import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { HomePage } from '../HomePage';
import { GuidanceMainPage } from './GuidanceMainPage';

export abstract class BaseGuidancePage extends BaseCompliancePage {
    protected readonly breadcrumbHome: Locator
    protected readonly breadcrumbGuidance: Locator;
    protected readonly pageTitle: Locator
    protected readonly pageHeading: Locator;
    protected readonly pageContext: Locator;
    protected readonly publisherInformation: Locator;

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbGuidance = page.getByLabel('Breadcrumb').getByRole('link', { name: 'Guidance' });
        this.pageTitle = page.getByRole('heading', { name: 'Guidance' });
        this.pageHeading = page.locator('h1.govuk-heading-l');
        this.pageContext = page.locator('#main-content');
        this.publisherInformation = page.getByRole('link', { name: 'Department for Energy Security and Net Zero' });
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
        return [this.pageContext];
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

    async getPageHeadingText(): Promise<string> {
        return await this.pageHeading.textContent() ?? '';
    }
}