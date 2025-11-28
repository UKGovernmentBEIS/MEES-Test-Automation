import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_ContactDetailsPage } from './PRSE_ContactDetailsPage';

export class PRSE_IndividualOrOrganisationPage {
    readonly page: Page;
    readonly individualButton: Locator;
    readonly continueButton: Locator;

    constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.individualButton = page.getByRole('radio', { name: 'Individual' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
    }

    /**
     * Verify user is on the PRSE_IndividualOrOrganisation page
     */
    async verifyOnPage(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.individualButton.waitFor();
    await this.continueButton.waitFor();
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
