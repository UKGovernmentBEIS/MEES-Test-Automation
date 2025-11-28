import { Page, Locator, expect } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities.ts';
import { PRSE_IndividualOrOrganisationPage } from './PRSE_IndividualOrOrganisationPage.ts';

export class PRSE_LandlordOrAgentPage {
  readonly page: Page;
  readonly landlordButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.landlordButton = page.getByRole('radio', { name: 'Landlord' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
  }

  /**
   * Verify user is on the PRSE_LandlordOrAgent page
   */
  async verifyOnPage(): Promise<void> {
  await this.page.waitForLoadState('domcontentloaded');
  await this.landlordButton.waitFor();
  await this.continueButton.waitFor();
  }

  /**
   * Select Landlord option
   */
  async selectLandlord(): Promise<void> {
    await ElementUtilities.waitForElement(this.landlordButton);
    await ElementUtilities.checkElement(this.landlordButton);
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<PRSE_IndividualOrOrganisationPage> {
    await ElementUtilities.clickElement(this.continueButton);
    return new PRSE_IndividualOrOrganisationPage(this.page);
  }
}