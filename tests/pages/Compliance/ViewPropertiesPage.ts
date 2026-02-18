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
    private totalRecordsField: Locator;
    private downloadButton: Locator;
    private noRecordsFoundMessage: Locator;

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
        this.totalRecordsField = this.page.getByText('results');
        this.downloadButton = this.page.getByRole('button', { name: 'Downloading all (CSV)' });
        this.noRecordsFoundMessage = this.page.getByText('No records found');
    }

    async waitForPageToLoad(additionalLocators?: Record<string, Locator>): Promise<void> {
        await super.waitForPageToLoad();

        const defaultLocators = {
            pageContext: this.pageContext,
            pageFooter: this.pageFooter,
            breadcrumbHomeLink: this.breadcrumbHomeLink,
            breadcrumbFilterPropertiesLink: this.breadcrumbFilterPropertiesLink,
            changeFiltersLink: this.changeFiltersLink,
            downloadButton: this.downloadButton
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
    await this.propertyTableRow.first().waitFor({ state: 'attached', timeout: 10000 });
    }

    async waitForNoRecordsMessage(): Promise<void> {
        await this.noRecordsFoundMessage.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getNoRecordsFoundMessage(): Promise<Locator> {
        return this.noRecordsFoundMessage;
    }

    async waitForTableOrNoRecords(): Promise<'content' | 'no-records'> {
        try {
            await Promise.race([
                this.propertyTableRow.first().waitFor({ state: 'attached', timeout: 10000 }),
                this.noRecordsFoundMessage.waitFor({ state: 'visible', timeout: 10000 })
            ]);
            
            // Determine which condition was met
            if (await this.propertyTableRow.first().isVisible()) {
                return 'content';
            } else {
                return 'no-records';
            }
        } catch (error) {
            throw error;
        }
    }

    async getPropertiesCountField(): Promise<Locator> {
        return this.totalRecordsField;
    }

    async getPropertiesDataFromTable(): Promise<PropertyData[]> {
        const propertiesData: PropertyData[] = [];
        const rowsCount = await this.propertyTableRow.count();

        for (let i = 0; i < rowsCount; i++) {
            const row = this.propertyTableRow.nth(i);
            const address = await row.locator('td').nth(0).innerText();
            const energyRating = await row.locator('td').nth(1).innerText();
            const epcExpiryDate = await row.locator('td').nth(2).innerText();
            const PRSExemptions = await row.locator('td').nth(3).innerText();
            const PRSEExemptionsColourClassName = await row.locator('td').nth(3).locator('strong').getAttribute('class') || '';
            const PRSEExemptionsColour = await this.extractExemptionsColourFromClassName(PRSEExemptionsColourClassName);
            propertiesData.push(new PropertyData(address, energyRating, epcExpiryDate, PRSExemptions, PRSEExemptionsColour));
        }
        return propertiesData;
    }

    private async extractExemptionsColourFromClassName(className: string): Promise<string> {
        // Assuming the class name contains a color indicator like "govuk-tag govuk-tag--light-blue"
        // Available colors: light-blue, blue, green, grey, orange, pink and yellow
        if (className.includes('govuk-tag--light-blue')) {
            return 'light-blue';
        } else if (className.includes('govuk-tag--blue') && !className.includes('govuk-tag--light-blue')) {
            return 'blue';
        } else if (className.includes('govuk-tag--green')) {
            return 'green';
        } else if (className.includes('govuk-tag--grey')) {
            return 'grey';
        } else if (className.includes('govuk-tag--orange')) {
            return 'orange';
        } else if (className.includes('govuk-tag--pink')) {
            return 'pink';
        } else if (className.includes('govuk-tag--yellow')) {
            return 'yellow';
        }
        return '';
    }
}

export class PropertyData {
    readonly address: string;
    readonly energyRating: string;
    readonly epcExpiryDate: string;
    readonly PRSExemptions: string;
    readonly PRSEExemptionsColour: string;

    constructor(
        address: string,
        energyRating: string,
        epcExpiryDate: string,
        PRSExemptions: string,
        PRSEExemptionsColour: string
    ) {
        this.address = address;
        this.energyRating = energyRating;
        this.epcExpiryDate = epcExpiryDate;
        this.PRSExemptions = PRSExemptions;
        this.PRSEExemptionsColour = PRSEExemptionsColour;
    }
}