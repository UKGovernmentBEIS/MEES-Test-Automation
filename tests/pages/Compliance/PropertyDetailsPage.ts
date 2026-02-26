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
        propertyType: string;
        epcExpiryDate: string;
        location: string | null;
        rateableValue: number | null;
        transactionType: string;
        datasetCode: string;
    };
    epcCertificates: Array<{
        assetRating: number;
        assetRatingBand: string;
        lodgementDate: string;
        expiryDate: string;
    }>;
    landlords: Array<{
        uprn: number;
        companyName: string;
        location: string;
        address: string;
        sicCodeSicText: string | null;
    }>;
}

interface Comment {
    commentText: string;
    commentAnnotations: string | null;
}

export class PropertyDetailsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private breadcrumbHome: Locator;
    private breadcrumbViewPropertyRecords: Locator;
    private breadcrumbFilterPropertiesRecords: Locator;
    private tabEnergyRatingsAndPRSExemptions: Locator;
    private tabEPCHistory: Locator;
    private epcHistoryTable: Locator;
    private previousComments: Locator;
    private commentTextArea: Locator;
    private commentSaveButton: Locator;
    private commentCancelButton: Locator;
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
        this.previousComments = page.locator('.comments-list .comment-item');
        this.commentTextArea = page.locator('div textarea')
        this.commentSaveButton = page.getByRole('button', { name: 'Save comment' });
        this.commentCancelButton = page.getByRole('link', { name: 'Cancel' });
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
            await this.previousComments.getByText(commentValueBeforeSave).waitFor({ timeout: 5000 });
        }
    }

    async cancelComment(): Promise<void> {
        await this.commentCancelButton.click();
    }

    async isCommentTextAreaInErrorState(): Promise<boolean> {
        const classAttribute = await this.commentTextArea.getAttribute('class');
        return classAttribute?.includes('govuk-textarea--error') || false;
    }

    async getPreviousComments(): Promise<Comment[]> {
        // Get all comment elements within the previous comments section
        const commentElements = this.previousComments;
        const commentCount = await commentElements.count();
        const comments: Comment[] = [];

        // Loop through each comment element and extract the comment text and annotations
        for (let i = 0; i < commentCount; i++) {
            const commentElement = commentElements.nth(i);
            const commentText = await commentElement.locator('.comment-text').innerText();
            const commentAnnotations = await commentElement.locator('.comment-meta').innerText();
            comments.push({ commentText, commentAnnotations });
        }

        return comments;
    }

    //#endregion
}