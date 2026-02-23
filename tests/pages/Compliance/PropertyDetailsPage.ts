import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { HomePage } from './HomePage';

export class PropertyDetailsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private breadcrumbHome: Locator;
    private breadcrumbViewPropertyRecords: Locator;
    private breadcrumbFilterPropertiesRecords: Locator;
    private tabEnergyRatingsAndPRSExemptions: Locator;
    private tabEPCHistory: Locator;
    private commentTextArea: Locator;
    private commentSaveButton: Locator;
    private commentCancelButton: Locator;
    private commentExpandButton: Locator;
    private previousCommentsSection: Locator;
    private propertyDetailsRows: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.breadcrumbViewPropertyRecords = page.getByRole('link', { name: 'View property records' });
        this.breadcrumbFilterPropertiesRecords = page.getByRole('link', { name: 'Filter property records' });
        this.tabEnergyRatingsAndPRSExemptions = page.locator('div').filter({ hasText: /^Energy ratings and PRS exemptions$/ })
        this.tabEPCHistory = page.locator('div').filter({ hasText: /^EPC history$/ })
        this.commentTextArea = page.locator('div textarea')
        this.commentSaveButton = page.getByRole('button', { name: 'Save comment' });
        this.commentCancelButton = page.getByRole('button', { name: 'Cancel' });
        this.commentExpandButton = page.getByRole('button', { name: 'Previous comments' })
        this.previousCommentsSection = page.getByLabel('Previous comments content')
        this.propertyDetailsRows = page.locator('c-mees-property-details')
            .filter({ has: page.locator('text=View property and landlord details') })
            .locator('.govuk-summary-list__row'); 
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
                commentExpandButton: this.commentExpandButton
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
        const detailRow = this.propertyDetailsRows
            .filter({ has: this.page.locator('.govuk-summary-list__key', { hasText: detailName }) });
        return detailRow.locator('.govuk-summary-list__value');
    }

    //#region Comments Section Methods

    async enterComment(comment: string): Promise<void> {
        await this.commentTextArea.fill(comment);

        // Verify that the comment has been entered correctly
        const enteredComment = await this.commentTextArea.inputValue();
        if (enteredComment !== comment) {
            throw new Error(`Failed to enter comment. Expected: '${comment}', but got: '${enteredComment}'`);
        }
    }

    async saveComment(): Promise<void> {
        // Get comment text before saving to compare later
        const comment = await this.commentTextArea.inputValue();
        const isCommentEmpty: boolean = comment.trim() === '';

        await this.commentSaveButton.click();

        // Wait for the textarea to be cleared
        await this.page.waitForFunction(
            async (textarea) => {
                return await textarea.textContent() === '';
            },
            this.commentTextArea,
            { timeout: 10000 }
        );

        // Make sure that the previous comments section is visible otherwise click on the comment expand button to show it
        if (!await this.previousCommentsSection.isVisible()) {
            await this.expandPreviousComments();
        }
        if (!await this.previousCommentsSection.isVisible()) {
            throw new Error('Previous comments section is not visible after saving a comment');
        }

        // If comment was provided, get all previous comments and verify that the newly added comment is present in the list
        if (!isCommentEmpty) {
            const previousCommentsText = await this.previousCommentsSection.innerText();
            if (!previousCommentsText.includes(comment)) {
                throw new Error(`Failed to save comment. Expected comment: '${comment}' not found in previous comments.`);
            }
        }
    }

    async cancelComment(): Promise<void> {
        await this.commentCancelButton.click();
    }

    async expandPreviousComments(): Promise<void> {
        await this.commentExpandButton.click();
    }

    async getPreviousComments(): Promise<string> {
        await this.expandPreviousComments();
        return await this.previousCommentsSection.innerText();
    }

    //#endregion
}