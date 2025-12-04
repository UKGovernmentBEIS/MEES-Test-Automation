import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_ContactDetailsPage } from './PRSE_ContactDetailsPage';

export class PRSE_IndividualOrOrganisationPage {
    private readonly page: Page;
    private readonly individualButton: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.individualButton = page.getByRole('radio', { name: 'Individual' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
    }

    /**
     * Wait for the PRSE_IndividualOrOrganisation page to load
     */
    private async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Individual Or Organisation Page',
            {
                individualButton: this.individualButton,
                continueButton: this.continueButton
            }
        );
    }

    /**
     * Select Individual option
     */
    async selectIndividual(): Promise<void> {
        await ElementUtilities.waitForElement(this.individualButton);
        await ElementUtilities.checkElement(this.individualButton);
    }

    /**
     * Click the continue button
     */
    async clickContinue(): Promise<PRSE_ContactDetailsPage> {
        await ElementUtilities.clickElement(this.continueButton);
        return new PRSE_ContactDetailsPage(this.page);
  }
}
