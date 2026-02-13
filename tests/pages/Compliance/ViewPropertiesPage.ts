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
    private breadcrumbFilterPropertiesLink: Locator;
    private changeFiltersLink: Locator;
    private propertyTableRow: Locator;
    private paginationContainer: Locator;
    private nextPageButton: Locator;
    private previousPageButton: Locator;
    private lastPageButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = this.page.locator('#main-content');
        this.propertyFilterRow = this.page.locator('.govuk-summary-list__row');
        this.propertyFilterRowKey = this.page.locator('.govuk-summary-list__key');
        this.breadcrumbHomeLink = this.page.getByRole('link', { name: 'Home' });
        this.breadcrumbFilterPropertiesLink = this.page.getByRole('link', { name: 'Filter property records' });
        this.changeFiltersLink = this.page.getByRole('link', { name: 'Change filters' });
        this.propertyTableRow = this.page.locator('table.govuk-table tbody tr');
        this.paginationContainer = this.page.locator('nav.govuk-pagination');
        this.nextPageButton = this.paginationContainer.getByRole('link', { name: 'Next page' });
        this.previousPageButton = this.paginationContainer.getByRole('link', { name: 'Previous page' });
        this.lastPageButton = this.paginationContainer.locator('.govuk-pagination__list .govuk-pagination__item');
    }

    async waitForPageToLoad(additionalLocators?: Record<string, Locator>): Promise<void> {
        await super.waitForPageToLoad();

        const defaultLocators = {
            pageContext: this.pageContext,
            pageFooter: this.pageFooter,
            breadcrumbHomeLink: this.breadcrumbHomeLink,
            breadcrumbFilterPropertiesLink: this.breadcrumbFilterPropertiesLink,
            changeFiltersLink: this.changeFiltersLink
        };

        const locatorsToWaitFor = additionalLocators 
            ? { ...defaultLocators, ...additionalLocators }
            : defaultLocators;

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'View Properties Page',
            locatorsToWaitFor
        );
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

    async clickBreadcrumbFilterProperties(): Promise<FilterPropertiesPage> {
        await this.breadcrumbFilterPropertiesLink.click();

        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickChangeFilters(): Promise<FilterPropertiesPage> {
        await this.changeFiltersLink.click();

        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    getPropertyTableRow(): Locator {
        return this.propertyTableRow;
    }

    async getTotalRecordsCount(): Promise<number> {
        return await this.getPropertyTableRow().count();
    }

    getPaginationContainer(): Locator {
        return this.paginationContainer;
    }

    getNextPageButton(): Locator {
        return this.nextPageButton;
    }

    getPreviousPageButton(): Locator {
        return this.previousPageButton;
    }

    getCurrentPageNumber(): Locator {
        return this.paginationContainer.locator('.govuk-pagination__item--current a');
    }

    getPageNumber(pageNum: number): Locator {
        return this.paginationContainer.locator(`a[data-page="${pageNum}"]`);
    }

    isPageCurrent(pageNum: number): Locator {
        return this.paginationContainer.locator(`.govuk-pagination__item--current a[aria-label="Page ${pageNum}"]`);
    }

    async clickNextPage(): Promise<void> {
        await this.nextPageButton.click();
    }

    async clickPreviousPage(): Promise<void> {
        await this.previousPageButton.click();
    }

    async navigateToLastPage(): Promise<void> {
        const lastPageItem = this.lastPageButton
            .filter({ has: this.page.locator('a') })
            .last();
        
        // Click on the link within the last page item
        await lastPageItem.locator('a').click();
    }

    async waitForTableContent(): Promise<void> {
    await Promise.race([
        this.propertyTableRow.first().waitFor({ state: 'attached', timeout: 10000 })
    ]);
}
}