import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { HomePage } from '../HomePage';
import { LandingPage } from '../../LandingPage';

export class SupportSubmittedPage extends BaseCompliancePage {
    private pageContext: Locator;
    private returnHomeButton: Locator;
    protected readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.returnHomeButton = page.getByRole('button', { name: 'Return to home' });
    }

    // Wait for the Support Submitted page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Submitted Page', {
            pageContext: this.pageContext,
            returnHomeButton: this.returnHomeButton
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() &&
            await this.returnHomeButton.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickReturnHomeButton(): Promise<HomePage> {
        await this.returnHomeButton.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async clickReturnHomeButtonAsUnauthenticatedUser(): Promise<LandingPage> {
        await this.returnHomeButton.click();
        const landingPage = new LandingPage(this.page);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }
}