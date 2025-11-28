import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class PRSE_ContactDetailsPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly continueButton: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
    this.validationError = page.locator('.govuk-error-summary').first();
  }

  /**
   * Verify user is on the PRSExemptionRegister page
   */
  async verifyOnPage(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.firstNameInput.waitFor();
    await this.lastNameInput.waitFor();
    await this.continueButton.waitFor();  
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<void> {
    await ElementUtilities.clickElement(this.continueButton);
  }

  /**
   * Fill contact details with first name and last name
   * @param firstName The first name to enter
   * @param lastName The last name to enter
   */
  async fillContactDetails(firstName: string, lastName: string): Promise<void> {
    await ElementUtilities.fillText(this.firstNameInput, firstName);
    await ElementUtilities.fillText(this.lastNameInput, lastName);
  }

  /**
   * Verify validation error is displayed
   */
  async isValidationErrorPanelDisplayed(): Promise<boolean> {
    return await this.validationError.isVisible();
  }
}
