import { Page, Locator, APIRequestContext } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { HomePage } from './HomePage';

export interface EPCHistory {
    assetRatingBand: string;
    expiryDate: string;
}

export interface DMSPropertyDetails {
    property: {
        uprn: number;
        buildingReferenceNumber: number;
        name: string | null;
        number: string | null;
        flatNameNumber: string | null;
        line1: string | null;
        line2: string | null;
        line3: string | null;
        town: string;
        county: string | null;
        postcode: string;
        localAuthority: string;
        epcEnergyRating: number;
        epcEnergyRatingBand: string;
        epcPropertyType: string;
        epcExpiryDate: string;
        rateableValue: number | null;
        epcTransactionType: string;
        datasetCode: string | null;
        possibleEvidenceEpcTransactionType: boolean;
        possibleEvidenceSiccode: boolean;
        certificateLink: string | null;
    };
    epcCertificates: Array<{
        uprn: number;
        assetRating: number;
        assetRatingBand: string;
        lodgementDate: string;
        expiryDate: string;
        transactionType: string;
    }>;
    landlords: Array<{
        uprn: number;
        companyName: string;
        location: string;
        address: string;
        sicCodeSicText1: string | null;
        sicCodeSicText2: string | null;
        sicCodeSicText3: string | null;
        sicCodeSicText4: string | null;
    }>;
}

interface Comment {
    commentText: string;
    commentAnnotations: string | null;
}

export class PropertyDetailsPage extends BaseCompliancePage {
    private breadcrumbHome: Locator;
    private breadcrumbViewPropertyRecords: Locator;
    private breadcrumbFilterPropertiesRecords: Locator;
    private commentsList: Locator;
    private commentTextArea: Locator;
    private commentSaveButton: Locator;
    private commentCancelButton: Locator;
    private propertyDetails: Locator;
    private propertyDetailsRows: Locator;
    private propertyExemptionDetails: Locator;
    private propertyExemptionDetailsRows: Locator;
    private noEPCHistoryMessage: Locator;
    private tab(tabName: string): Locator { return this.page.locator(`//li/div[contains(text(), '${tabName}')]`); }
    private tabParentElement(tabName: string): Locator { return this.tab(tabName).locator('..'); }

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbViewPropertyRecords = page.getByRole('link', { name: 'View property records' });
        this.breadcrumbFilterPropertiesRecords = page.getByRole('link', { name: 'Filter property records' });
        this.commentsList = page.locator('.comments-list');
        this.commentTextArea = page.locator('div textarea')
        this.commentSaveButton = page.getByRole('button', { name: 'Save comment' });
        this.commentCancelButton = page.getByRole('link', { name: 'Cancel' });
        this.propertyDetails = page.locator('.govuk-summary-list').first();
        this.propertyDetailsRows = this.propertyDetails.locator('.govuk-summary-list__row');
        this.propertyExemptionDetails = page.locator('.govuk-summary-list').nth(1);
        this.propertyExemptionDetailsRows = this.propertyExemptionDetails.locator('.govuk-summary-list__row');
        this.noEPCHistoryMessage = page.locator('[data-id="EPCTab"] p.govuk-body');
    }

    // Wait for the Property Details Page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Property Details Page',
            {
                breadcrumbHome: this.breadcrumbHome,
                breadcrumbViewPropertyRecords: this.breadcrumbViewPropertyRecords,
                breadcrumbFilterPropertiesRecords: this.breadcrumbFilterPropertiesRecords,
                signOutButton: this.signOutButton,
                commentTextArea: this.commentTextArea,
                commentSaveButton: this.commentSaveButton,
                commentCancelButton: this.commentCancelButton,
                propertyDetailsRows: this.propertyDetailsRows,
                propertyExemptionDetailsRows: this.propertyExemptionDetailsRows
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('view-details');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.propertyDetails];
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

    async ClickTab(tabName: string): Promise<void> {
        switch (tabName) {
            case 'Property details':
                await this.tab(tabName).click();
                break;
            case 'Property owner(s)':
                await this.tab(tabName).click();
                break;
            case 'Energy efficiency details':
                await this.tab(tabName).click();
                break;
            case 'PRS exemptions and penalties':
                await this.tab(tabName).click();
                break;
            default:
                throw new Error(`Tab with name ${tabName} is not defined on Property Details Page`);
        }
    }

    async getPropertyDetails(detailName: string): Promise<Locator> {
        // Click on the 'Property Details' tab to ensure the details section is visible before trying to locate the detail
        await this.ClickTab('Property details');

        // Filter the property details rows to find the one that contains the specified detail name, then get the corresponding value
        const detailRow: Locator = this.propertyDetailsRows
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(detailName, { exact: true }) });
        return detailRow.locator('.govuk-summary-list__value');
    }

    async getExemptionDetails(detailName: string): Promise<Locator> {
        // Click on the 'PRS exemptions and penalties' tab to ensure the details section is visible before trying to locate the detail
        await this.ClickTab('PRS exemptions and penalties');

        // Search all summary list rows on the page rather than relying on .nth(1), because LWC removes
        // non-active tab content from the DOM on tab switch, shifting the index of remaining summary lists.
        const detailRow: Locator = this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(detailName, { exact: true }) });
        let value = detailRow.locator('.govuk-summary-list__value');
        return value;
    }

    async getEnergyEfficiencyDetails(detailName: string): Promise<Locator> {
        // Click on the 'Energy efficiency details' tab to ensure the details section is visible before trying to locate the detail
        await this.ClickTab('Energy efficiency details');

        // Search all summary list rows on the page rather than relying on .nth(0), because LWC removes non-active tab content from the DOM on tab switch, shifting the index of remaining summary lists.
        const detailRow: Locator = this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(detailName, { exact: true }) });
        let value = detailRow.locator('.govuk-summary-list__value');
        return value;
    }

    async DisplayEPCHistoryData(): Promise<void> {
        await this.ClickTab('Energy efficiency details');

        // Check if the EPC Tab is active
        const classAttribute = await await this.tabParentElement('Energy efficiency details').getAttribute('class');
        const isTabActive = classAttribute?.includes('govuk-tabs__list-item--selected')
        if (!isTabActive) {
            throw new Error('Failed to display EPC History data. The EPC History tab is not active after clicking on it.');
        }
        
        const hasSelectedClass = classAttribute?.includes('govuk-tabs__list-item--selected')

        if (!hasSelectedClass) {
            throw new Error('Failed to display EPC History data. The EPC History tab is not active after clicking on it.');
        }
    }

    async getNoEPCHistoryMessageText(): Promise<string> {
        await this.ClickTab('Energy efficiency details');
        return this.noEPCHistoryMessage.innerText();
    }

    async getEPCHistoryTableData(): Promise<EPCHistory[]> {
        let epcHistoryData: EPCHistory[] = [];

        const rows = this.page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const assetRatingBand = await row.locator('td').nth(0).innerText();
            const expiryDate = await row.locator('td').nth(1).innerText();
            epcHistoryData.push({ assetRatingBand, expiryDate });
        }
        return epcHistoryData;
    }

    async GetDMSPropertyDetailsValues(request: APIRequestContext, uprn: string): Promise<DMSPropertyDetails> {
        const baseUrl = process.env.DMS_BASE_URL + '/mees/property';

        const response = await request.get(`${baseUrl}?uprn=${uprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });

        if (response.status() !== 200) {
            throw new Error(`DMS API request failed with status: ${response.status()}`);
        }

        return await response.json() as DMSPropertyDetails;
    }

    //#region Comments Section Methods

    async addComment(comment: string): Promise<void> {
        await this.commentTextArea.fill(comment);
    }

    async saveComment(): Promise<void> {
        // Get text area value before saving comment to verify that the comment is being saved correctly
        const commentValueBeforeSave = await this.commentTextArea.getAttribute('value') || '';

        // Click save button
        await this.commentSaveButton.click();

        // Search for the text from the comment text area in the previous comments to confirm that the comment has been saved
        // Do it only if comment text area wasn't empty
        if (commentValueBeforeSave.trim() !== '') {
            await this.commentsList.getByText(commentValueBeforeSave).waitFor({ timeout: 5000 });
        }
    }

    async cancelComment(): Promise<void> {
        await this.commentCancelButton.click();
    }

    async isCommentTextAreaInErrorState(): Promise<boolean> {
        const classAttribute = await this.commentTextArea.getAttribute('class');
        return classAttribute?.includes('govuk-textarea--error') || false;
    }

    async getComments(): Promise<Locator> {
        return this.commentsList;
    }
    //#endregion
}