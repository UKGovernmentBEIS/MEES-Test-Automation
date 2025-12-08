import { Page, Locator, expect } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities.ts';
import { PRSE_IndividualOrOrganisationPage } from './PRSE_IndividualOrOrganisationPage.ts';

export class PRSE_LandlordOrAgentPage {
  private readonly page: Page;
  private readonly landlordButton: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.landlordButton = page.getByRole('radio', { name: 'Landlord' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
  }

  /**
   * Wait for the PRSE_LandlordOrAgent page to load
   */
  private async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Landlord Or Agent Page',
      {
        landlordButton: this.landlordButton,
        continueButton: this.continueButton
      }
    );
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
    
    const nextPage = new PRSE_IndividualOrOrganisationPage(this.page);
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Individual Or Organisation Page',
      {
        individualButton: nextPage['individualButton'],
        continueButton: nextPage['continueButton']
      }
    );
    
    return nextPage;
  }
}