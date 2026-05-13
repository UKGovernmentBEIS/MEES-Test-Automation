import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { HomePage } from './HomePage';

export class ContactDetailsConfirmationPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly confirmationPanel: Locator;
    private readonly returnToHomeButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.confirmationPanel = page.locator('.govuk-panel--confirmation');
        this.returnToHomeButton = page.getByRole('button', { name: 'Return to home' });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Contact Details Confirmation Page',
            {
                pageContext: this.pageContext,
                confirmationPanel: this.confirmationPanel,
                returnToHomeButton: this.returnToHomeButton,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.confirmationPanel.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async getConfirmationMessage(): Promise<string> {
        return this.confirmationPanel.innerText();
    }

    async clickReturnToHome(): Promise<HomePage> {
        await this.returnToHomeButton.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
}
