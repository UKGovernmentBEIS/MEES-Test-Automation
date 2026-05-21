import { Page, Locator, APIRequestContext } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { HomePage } from './HomePage';

export interface EPCHistory {
    energyRating: string;
    epcExpiryDate: string;
    epcTransactionType: string;
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
    private commentTextArea: Locator;
    private commentSaveButton: Locator;
    private commentCancelButton: Locator;
    private propertyDetails: Locator;
    private noEPCHistoryMessage: Locator;
    private commentPrivacyStatement: Locator;
    private linkWhereThisDataComesFrom: Locator;
    private tab(tabName: string): Locator { return this.page.locator(`//li/div[contains(text(), '${tabName}')]`); }
    private tabParentElement(tabName: string): Locator { return this.tab(tabName).locator('..'); }

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbViewPropertyRecords = page.getByRole('link', { name: 'View property records' });
        this.breadcrumbFilterPropertiesRecords = page.getByRole('link', { name: 'Filter property records' });
        this.commentTextArea = page.locator('div textarea')
        this.commentSaveButton = page.getByRole('button', { name: 'Save comment' });
        this.commentCancelButton = page.getByRole('link', { name: 'Cancel' });
        this.propertyDetails = page.locator('.govuk-summary-list').first();
        this.noEPCHistoryMessage = page.locator('[data-id="EPCTab"] p.govuk-body');
        this.commentPrivacyStatement = page.getByText('Comments are visible to other enforcement officers in your Trading Standards Office and to DESNZ Policy Officials.', { exact: true });
        this.linkWhereThisDataComesFrom = page.getByRole('link', { name: 'where this data comes from' });
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
                linkWhereThisDataComesFrom: this.linkWhereThisDataComesFrom
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('view-details');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.propertyDetails, this.commentPrivacyStatement];
    }

    //#region Breadcrumb Methods

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

    async clickLinkWhereThisDataComesFrom(): Promise<void> {
        await this.linkWhereThisDataComesFrom.click();
    }

    //#endregion

    //#region Property Details Tab Methods

    private readonly tabNameToElementIDMapping: Record<string, string> = {
        'Property details': 'PropertyDetailsTab',
        'Property owner(s)': 'PropertyOwnerTab',
        'Energy efficiency details': 'EPCTab',
        'PRS exemptions and penalties': 'PRSTab'
    };

    async SelectTab(tabName: string): Promise<void> {
        // Confirm that tab name is valid
        if (!this.tabNameToElementIDMapping[tabName]) {
            throw new Error(`Failed to select tab. Tab with name '${tabName}' does not exist on Property Details Page.`);
        }

        // Click on the tab
        await this.tab(tabName).click();

        // Check if the clicked tab is active
        if (!await this.isTabActive(tabName)) {
            throw new Error(`Failed to switch to the '${tabName}' tab. The tab is not active after clicking on it.`);
        }
    }

    private getTabElementIDNameByTabName(tabName: string): string {
        const elementIDName = this.tabNameToElementIDMapping[tabName];
        if (!elementIDName) {
            throw new Error(`Failed to get tab element ID name. Tab with name '${tabName}' does not exist on Property Details Page.`);
        }
        return elementIDName;
    }

    async getPropertyDetailsByTabNameAndFieldName(tabName: string, fieldName: string): Promise<string> {
        // Confirm that tab name is valid
        if (!this.tabNameToElementIDMapping[tabName]) {
            throw new Error(`Failed to get property details. Tab with name '${tabName}' does not exist on Property Details Page.`);
        }

        // Get field value based on the tab
        const fieldValueLocator = await this.getFieldValueLocatorByTabNameAndFieldName(tabName, fieldName);
        return await fieldValueLocator.textContent() || '';
    }

    async getFieldValueLocatorByTabNameAndFieldName(tabName: string, fieldName: string): Promise<Locator> {
        // Confirm that the correct tab is active
        if (!await this.isTabActive(tabName)) {
            throw new Error(`Failed to get property details. The '${tabName}' tab is not active.`);
        }

        // Get the correct field value locator for provided tab and field name
        const tabElementID = this.getTabElementIDNameByTabName(tabName);
        return this.page.locator(`[data-id="${tabElementID}"] .govuk-summary-list__row`)
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(fieldName, { exact: true }) })
            .locator('.govuk-summary-list__value');
    }

    private async isTabActive(tabName: string): Promise<boolean> {
        const classAttribute = await this.tabParentElement(tabName).getAttribute('class');
        return classAttribute?.includes('govuk-tabs__list-item--selected') || false;
    }

    async getNoEPCHistoryMessageText(): Promise<string> {
        // Confirm that the 'Energy efficiency details' tab is active
        if (!await this.isTabActive('Energy efficiency details')) {
            throw new Error('Failed to get no EPC history message text. The Energy efficiency details tab is not active.');
        }

        const isNoEPCMessageVisible = await this.noEPCHistoryMessage.isVisible();
        if (!isNoEPCMessageVisible) {
            throw new Error('Failed to get no EPC history message text. The no EPC history message is not visible on the page.');
        }

        return this.noEPCHistoryMessage.innerText();
    }

    async getEPCHistoryTableData(): Promise<EPCHistory[]> {
        // Confirm that the 'Energy efficiency details' tab is active
        if (!await this.isTabActive('Energy efficiency details')) {
            throw new Error('Failed to get EPC history table data. The Energy efficiency details tab is not active.');
        }

        let epcHistoryData: EPCHistory[] = [];

        const rows = this.page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const energyRating = await row.locator('td').nth(0).innerText();
            const epcExpiryDate = await row.locator('td').nth(1).innerText();
            const epcTransactionType = await row.locator('td').nth(2).innerText();
            epcHistoryData.push({ energyRating, epcExpiryDate, epcTransactionType });
        }
        return epcHistoryData;
    }

    async getNumberOfPropertyOwners(): Promise<number> {
        // Confirm that the 'Property owner(s)' tab is active
        if (!await this.isTabActive('Property owner(s)')) {
            throw new Error('Failed to get number of property owners. The Property owner(s) tab is not active.');
        }

        return await this.page.locator('//h2[contains(text(), "Property owner")]').count();
    }

    async getPropertyOwnerFieldValueByOwnerIndex(ownerIndex: number, fieldName: string): Promise<string> {
        // Confirm that the 'Property owner(s)' tab is active
        if (!await this.isTabActive('Property owner(s)')) {
            throw new Error('Failed to get property owner details. The Property owner(s) tab is not active.');
        }

        const fieldValueLocator = this.page.locator(`(//h2[contains(text(), "Property owner")])[${ownerIndex + 1}]`)
            .locator('..')
            .locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(fieldName, { exact: true }) })
            .locator('.govuk-summary-list__value');
        return await fieldValueLocator.textContent() || '';
    }

    //#endregion

    //#region DMS API Methods

    async GetDMSPropertyDetailsValues(request: APIRequestContext, uprn: string | null = null, buildingReferenceNumber: string | null = null): Promise<DMSPropertyDetails> {
        const baseUrl = process.env.DMS_BASE_URL + '/mees/property';

        let queryParam = '';
        if (uprn) {
            queryParam = `uprn=${uprn}`;
        } else if (buildingReferenceNumber) {
            queryParam = `buildingrefnum=${buildingReferenceNumber}`;
        } else {
            throw new Error('Either uprn or buildingReferenceNumber must be provided');
        }

        const response = await request.get(`${baseUrl}?${queryParam}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });

        if (response.status() !== 200) {
            throw new Error(`DMS API request failed with status: ${response.status()}`);
        }

        return await response.json() as DMSPropertyDetails;
    }

    GetPossibleRentalEvidenceFromDMSPropertyDetails(dmsPropertyDetails: DMSPropertyDetails) {
        const possibleEvidenceTypes = [];
        if (dmsPropertyDetails.property.possibleEvidenceEpcTransactionType) {
            possibleEvidenceTypes.push('Mandatory issue (Property to let) EPC transaction type');
        }
        if (dmsPropertyDetails.property.possibleEvidenceSiccode) {
            possibleEvidenceTypes.push('Property owner has letting company SIC code');
        }
        return possibleEvidenceTypes.join(' | ');
    }

    //#endregion

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
            await (await this.getComments()).getByText(commentValueBeforeSave).waitFor({ timeout: 5000 });
        }
    }

    async cancelComment(): Promise<void> {
        await this.commentCancelButton.click();
    }

    async isCommentTextAreaInErrorState(): Promise<boolean> {
        const classAttribute = await this.commentTextArea.getAttribute('class');
        return classAttribute?.includes('govuk-textarea--error') || false;
    }

    // This method can only be used when there is at least one comment for the property, otherwise it will throw an error
    async getComments(): Promise<Locator> {
        return await this.page.locator('c-mees-property-comments div.comment-meta')
            .locator('..')
            .first()
            .waitFor({ state: 'visible' })
            .then(
                () => this.page.locator('c-mees-property-comments div.comment-meta').locator('..')
            );;
    }

    async getCommentsTestData(): Promise<Comment[]> {
        const rawComments = await (await this.getComments()).allInnerTexts();
        rawComments.length === 0 && (() => { throw new Error('No comments found for the property'); })();
        
        return rawComments.map(comment => {
            const [commentText, ...commentAnnotationParts] = comment.split('\n');
            const commentAnnotations = commentAnnotationParts.join('\n') || null;
            return { commentText, commentAnnotations };
        });
    }
    //#endregion
}