import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LandlordOrAgentPage } from './PRSE_LandlordOrAgentPage.ts';

export class PRSE_HaveRegisteredExemptionPage {
  readonly page: Page;
  readonly registeredBeforeNoButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registeredBeforeNoButton = page.getByRole('radio', { name: 'No' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
  }

  /**
   * Wait for the PRSE_HaveRegisteredExemption page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.registeredBeforeNoButton.waitFor();
    await this.continueButton.waitFor();
  }

  /**
   * Answer the 'registered before' question with No
   */
  async selectNotRegisteredBefore(): Promise<void> {
    await ElementUtilities.checkElement(this.registeredBeforeNoButton);
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<PRSE_LandlordOrAgentPage> {
    await ElementUtilities.clickElement(this.continueButton);
    return new PRSE_LandlordOrAgentPage(this.page);
  }
}