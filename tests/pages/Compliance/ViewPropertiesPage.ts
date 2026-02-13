import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { HomePage } from './HomePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';

export class ViewPropertiesPage extends BaseCompliancePage {
    private pageContext: Locator = this.page.locator('#main-content');
    private propertyFilterRow: Locator = this.page.locator('.govuk-summary-list__row');
    private propertyFilterRowKey: Locator = this.page.locator('.govuk-summary-list__key');
    private breadcrumbHomeLink: Locator = this.page.getByRole('link', { name: 'Home' });
    private breadcrumbFilterPropertiesLink: Locator = this.page.getByRole('link', { name: 'Filter property records' });
    private changeFiltersLink: Locator = this.page.getByRole('link', { name: 'Change filters' });
    private propertyTableRow: Locator = this.page.locator('table.govuk-table tbody tr');
    private paginationContainer: Locator = this.page.locator('nav.govuk-pagination');
    private nextPageButton: Locator = this.paginationContainer.getByRole('link', { name: 'Next page' })
    private previousPageButton: Locator = this.paginationContainer.getByRole('link', { name: 'Previous page' });
    private lastPageButton: Locator = this.paginationContainer.locator('.govuk-pagination__list .govuk-pagination__item');

    constructor(page: Page) {
        super(page);
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