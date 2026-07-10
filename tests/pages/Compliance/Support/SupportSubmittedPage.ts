import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { HomePage } from '../HomePage';
import { LandingPage } from '../../LandingPage';

export class SupportSubmittedPage extends BaseCompliancePage {
    private pageContext: Locator;
    private exitThisFormButton: Locator;
    private referenceNumber: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.exitThisFormButton = page.getByRole('button', { name: 'Exit this form' });
        this.referenceNumber = page.locator('[part="formatted-rich-text"] b');
    }

    // Wait for the Support Submitted page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Submitted Page', {
            pageContext: this.pageContext,
            exitThisFormButton: this.exitThisFormButton,
            referenceNumber: this.referenceNumber
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() &&
            await this.exitThisFormButton.isVisible() &&
            await this.referenceNumber.isVisible();
    }

    async getReferenceNumber(): Promise<string> {
        return await this.referenceNumber.textContent() ?? '';
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickExitThisFormButton(): Promise<HomePage> {
        await this.exitThisFormButton.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async clickExitThisFormButtonAsUnauthenticatedUser(): Promise<LandingPage> {
        await this.exitThisFormButton.click();
        const landingPage = new LandingPage(this.page);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }
}