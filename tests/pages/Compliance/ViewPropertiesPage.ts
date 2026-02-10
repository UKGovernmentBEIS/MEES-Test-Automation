import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';

export class ViewPropertiesPage extends BaseCompliancePage {
    private pageContext: Locator;
    private propertyFilterRow: Locator;
    private propertyFilterRowKey: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.propertyFilterRow = this.page.locator('.govuk-summary-list__row');
        this.propertyFilterRowKey = this.page.locator('.govuk-summary-list__key');
    }

    // Wait for the View Properties page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'View Properties Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
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
}