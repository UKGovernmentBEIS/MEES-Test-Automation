import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { HomePage } from './HomePage';

interface EPCHistory {
    assetRatingBand: string;
    lodgementDate: string;
    expiryDate: string;
}

export class PropertyDetailsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private breadcrumbHome: Locator;
    private breadcrumbViewPropertyRecords: Locator;
    private breadcrumbFilterPropertiesRecords: Locator;
    private tabEnergyRatingsAndPRSExemptions: Locator;
    private tabEPCHistory: Locator;
    private epcHistoryTable: Locator;
    private commentTextArea: Locator;
    private commentSaveButton: Locator;
    private commentCancelButton: Locator;
    private commentExpandButton: Locator;
    private previousCommentsSection: Locator;
    private propertyDetailsRows: Locator;
    private propertyExemptionDetailsRows: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbViewPropertyRecords = page.getByRole('link', { name: 'View property records' });
        this.breadcrumbFilterPropertiesRecords = page.getByRole('link', { name: 'Filter property records' });
        this.tabEnergyRatingsAndPRSExemptions = page.locator('div').filter({ hasText: /^Energy ratings and PRS exemptions$/ })
        this.tabEPCHistory = page.locator("//li[@data-id='EPCTab']");
        this.epcHistoryTable = page.locator("//div[@data-id='EPCTab']/table");
        this.commentTextArea = page.locator('div textarea')
        this.commentSaveButton = page.getByRole('button', { name: 'Save comment' });
        this.commentCancelButton = page.getByRole('button', { name: 'Cancel' });
        this.commentExpandButton = page.getByRole('button', { name: 'Previous comments' })
        this.previousCommentsSection = page.getByLabel('Previous comments content')
        this.propertyDetailsRows = page.locator('c-mees-property-details')
            .filter({ has: page.locator('text=View property and landlord details') })
            .locator('.govuk-summary-list__row'); 
        this.propertyExemptionDetailsRows = page.locator('.govuk-tabs__panel .govuk-summary-list__row');
    }

    // Wait for the Property Details Page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Property Details Page',
            {
                pageContext: this.pageContext,
                breadcrumbHome: this.breadcrumbHome,
                breadcrumbViewPropertyRecords: this.breadcrumbViewPropertyRecords,
                breadcrumbFilterPropertiesRecords: this.breadcrumbFilterPropertiesRecords,
                signOutButton: this.signOutButton,
                tabEnergyRatingsAndPRSExemptions: this.tabEnergyRatingsAndPRSExemptions,
                tabEPCHistory: this.tabEPCHistory,
                commentTextArea: this.commentTextArea,
                commentSaveButton: this.commentSaveButton,
                commentCancelButton: this.commentCancelButton,
                commentExpandButton: this.commentExpandButton,
                propertyDetailsRows: this.propertyDetailsRows,
                propertyExemptionDetailsRows: this.propertyExemptionDetailsRows
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('view-details');
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async clickBreadcrumbHome(): Promise<HomePage> {
        await this.breadcrumbHome.click();

        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
    
    async clickBreadcrumbFilterProperties(): Promise<FilterPropertiesPage> {
        await this.breadcrumbFilterPropertiesRecords.click();

        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickBreadcrumbViewProperties(): Promise<ViewPropertiesPage> {
        await this.breadcrumbViewPropertyRecords.click();

        const viewPropertiesPage = new ViewPropertiesPage(this.page);
        await viewPropertiesPage.waitForPageToLoad();
        return viewPropertiesPage;
    }

    async getPropertyDetails(detailName: string): Promise<Locator> {
        const detailRow: Locator = this.propertyDetailsRows
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(detailName, { exact: true }) });
        return detailRow.locator('.govuk-summary-list__value');
    }

    async getExemptionDetails(detailName: string): Promise<Locator> {
        const detailRow: Locator = this.propertyExemptionDetailsRows
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(detailName, { exact: true }) });
        let value = detailRow.locator('.govuk-summary-list__value');
        return value;
    }

    async DisplayEPCHistoryData(): Promise<void> {
        await this.tabEPCHistory.click();

        // Check if the EPC Tab is active
        const classAttribute = await this.tabEPCHistory.getAttribute('class');
        const hasSelectedClass = classAttribute?.includes('govuk-tabs__list-item--selected')

        if (!hasSelectedClass) {
            throw new Error('Failed to display EPC History data. The EPC History tab is not active after clicking on it.');
        }
    }

    async getEPCHistoryTableData(): Promise<EPCHistory[]> {
        let epcHistoryData: EPCHistory[] = [];

        const rows = this.epcHistoryTable.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const assetRatingBand = await row.locator('td').nth(0).innerText();
            const lodgementDate = await row.locator('td').nth(1).innerText();
            const expiryDate = await row.locator('td').nth(2).innerText();
            epcHistoryData.push({ assetRatingBand, lodgementDate, expiryDate });
        }
        return epcHistoryData;
    }

    //#region Comments Section Methods

    async addComment(comment: string): Promise<void> {
        await this.commentTextArea.fill(comment);
        await this.commentSaveButton.click();
    }

    async cancelComment(): Promise<void> {
        await this.commentCancelButton.click();
    }

    async expandPreviousComments(): Promise<void> {
        await this.commentExpandButton.click();
    }

    async previousComments(): Promise<Locator> {
        await this.expandPreviousComments();
        return this.previousCommentsSection;
    }

    //#endregion
}