import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { HomePage } from './HomePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';

export class ViewPropertiesPage extends BaseCompliancePage {
    private pageContext: Locator;
    private propertyFilterRow: Locator;
    private propertyFilterRowKey: Locator;
    private breadcrumbHomeLink: Locator;
    private breadcrumbViewPropertiesLink: Locator;
    private changeFiltersButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.propertyFilterRow = this.page.locator('.govuk-summary-list__row');
        this.propertyFilterRowKey = this.page.locator('.govuk-summary-list__key');
        this.breadcrumbHomeLink = page.getByRole('link', { name: 'Home' });
        this.breadcrumbViewPropertiesLink = page.getByRole('link', { name: 'Filter property records' });
        this.changeFiltersButton = page.getByRole('button', { name: 'Change filters' });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'View Properties Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
                breadcrumbHomeLink: this.breadcrumbHomeLink,
                breadcrumbViewPropertiesLink: this.breadcrumbViewPropertiesLink,
                changeFiltersButton: this.changeFiltersButton
            });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async getFilterCriterionValueField(filterName: string): Promise<Locator> {
        // Find the specific filter criterion row based on the provided filter name
        
        const filterRow = this.propertyFilterRow
            .filter({ has: this.propertyFilterRowKey.filter({ hasText: filterName }) });
        
        // Return the value field associated with the filter criterion
        return filterRow.locator('dd.govuk-summary-list__value');
    }

    async clickBreadcrumbHome(): Promise<HomePage> {
        await this.breadcrumbHomeLink.click();

        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async clickBreadcrumbViewProperties(): Promise<FilterPropertiesPage> {
        await this.breadcrumbViewPropertiesLink.click();

        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickChangeFilters(): Promise<FilterPropertiesPage> {
        await this.changeFiltersButton.click();

        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }
}