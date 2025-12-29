import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LandlordOrAgentPage } from './PRSE_LandlordOrAgentPage.ts';

export class PRSE_HaveRegisteredExemptionPage {
  private readonly page: Page;
  private readonly registeredBeforeNoButton: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registeredBeforeNoButton = page.getByRole('radio', { name: 'No' });
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
  }

  /**
   * Wait for the PRSE_HaveRegisteredExemption page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Have Registered Exemption Page',
      {
        registeredBeforeNoButton: this.registeredBeforeNoButton,
        continueButton: this.continueButton
      }
    );
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
    
    const nextPage = new PRSE_LandlordOrAgentPage(this.page);
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Landlord Or Agent Page',
      {
        landlordButton: nextPage['landlordButton'],
        continueButton: nextPage['continueButton']
      }
    );
    
    return nextPage;
  }
}