import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { HomePage } from './HomePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { PropertyDetailsPage } from './PropertyDetailsPage';
import * as fs from 'fs';
import * as path from 'path';

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
    private readonly exportButton: Locator;

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
        this.downloadButton = this.page.getByRole('button', { name: 'Export filtered table (.csv)' });
        this.noRecordsFoundMessage = this.page.getByText('No records found');
        this.exportButton = this.page.getByRole('button', { name: 'Export filtered table (.csv)' });
    }

    async waitForPageToLoad(additionalLocators?: Record<string, Locator>): Promise<void> {
        await super.waitForPageToLoad();

        const defaultLocators = {
            pageContext: this.pageContext,
            pageFooter: this.pageFooter,
            breadcrumbHomeLink: this.breadcrumbHomeLink,
            breadcrumbFilterPropertiesLink: this.breadcrumbFilterPropertiesLink,
            changeFiltersLink: this.changeFiltersLink,
            downloadButton: this.downloadButton,
            exportButton: this.exportButton
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

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
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

    async getPaginationContainer(): Promise<Locator> {
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
        const timeout = 10000; // 10 seconds timeout
        const pollInterval = 500; // Check every 500ms
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                // Get results count from the total records field
                const totalRecordsText = await this.totalRecordsField.innerText();
                const totalRecordsMatch = totalRecordsText.match(/(\d+)/);
                const totalRecords = totalRecordsMatch ? parseInt(totalRecordsMatch[1], 10) : 0;

                if (totalRecords > 0) {
                    // Check if the property address column header is visible (only present when data table is loaded)
                    const columnHeaderVisible = await this.page.getByRole('columnheader', { name: 'Property address' }).isVisible();
                    if (columnHeaderVisible) {
                        return; // Success - records found and table rendered
                    }
                }
            } catch (error) {
                // Continue retrying on any error during polling
            }

            // Wait before next retry
            await this.page.waitForTimeout(pollInterval);
        }

        // If we get here, timeout was reached
        const finalRecordsText = await this.totalRecordsField.innerText();
        throw new Error(`Timeout waiting for table content. Expected records > 0, but got '${finalRecordsText}' after ${timeout}ms`);
    }

    async getNoRecordsFoundMessage(): Promise<Locator> {
        return this.noRecordsFoundMessage;
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
            const PRSEExemptionsColourClassName = await row.locator('td').nth(3).locator('span').getAttribute('class') || '';
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

    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            } else if (char === ',' && !inQuotes) {
                // End of field - only split on commas outside quotes
                result.push(current.trim());
                current = '';
                i++;
            } else {
                // Regular character (including commas inside quotes)
                current += char;
                i++;
            }
        }
        
        // Add the last field
        result.push(current.trim());
        
        return result;
    }

    async ViewDetailsForPropertyWithAddress(address: string) {
        const row = this.propertyTableRow.filter({ hasText: address }).first();
        if (!await row.isVisible()) {
            throw new Error(`Property with address '${address}' not found.`);
        }
        await row.getByRole('link', { name: 'View details' }).first().click();
        const propertyDetailsPage = new PropertyDetailsPage(this.page);
        await propertyDetailsPage.waitForPageToLoad();
        return propertyDetailsPage;
    }

    async exportFilteredData(): Promise<Record<string, string>[]> { 
        // Click the export button
        await this.exportButton.click();
        
        // Wait for download to complete
        const download = await this.page.waitForEvent('download');
        
        // Get download path
        const downloadPath = path.join(__dirname, '../../../test-results', `export-${Date.now()}.csv`);
        await download.saveAs(downloadPath);
        
        // Read and parse the CSV file
        const csvContent = fs.readFileSync(downloadPath, 'utf-8');
        const lines: string[] = csvContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            throw new Error('Downloaded CSV file is empty');
        }
        
        // Parse header row
        const headers = this.parseCSVLine(lines[0]);
        
        // Parse data rows
        const exportedData: Record<string, string>[] = [];
        // Iterate through each data row
        for (let i = 1; i < lines.length; i++) {
            // Parse the CSV line properly to handle quoted fields with commas
            const values = this.parseCSVLine(lines[i]);
            const record: Record<string, string> = {};
            headers.forEach((header, index) => {
                if(header === 'Line1') {
                    record[header] = this.reverseDateConversion(values[index] || '');
                } else {
                    record[header] = values[index] || '';
                }
            });
            exportedData.push(record);
        }
        
        // Clean up the downloaded file
        fs.unlinkSync(downloadPath);
        
        return exportedData;
    }

    private reverseDateConversion(dateStr: string): string
    {
            const monthMapping: Record<string, string> = {
                'Jan': '1',
                'Feb': '2',
                'Mar': '3',
                'Apr': '4',
                'May': '5',
                'Jun': '6',
                'Jul': '7',
                'Aug': '8',
                'Sep': '9',
                'Oct': '10',
                'Nov': '11',
                'Dec': '12'
            };
            // Implementation for date conversion
            const regex = /(\d{1,2})-([A-Za-z]{3})/;
            const match = dateStr.match(regex);
    
            // If the date string matches the expected format, perform the conversion
            if (match) {
                const day = match[1];
                const monthAbbr = match[2];
                const month = monthMapping[monthAbbr];
                if (month) {
                    return `${day}-${month}`;
                } else {
                    // If month abbreviation is not recognized, return the original string
                    return dateStr;
                }
            } else {
                // If the string does not match the date format, return it as is (assuming it's already in the correct format)
                return dateStr;
            }
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