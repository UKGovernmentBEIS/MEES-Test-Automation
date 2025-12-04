import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class PRSE_ContactDetailsPage {
  private readonly page: Page;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly continueButton: Locator;
  private readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    this.continueButton = page.getByRole('button', { name: 'Save and continue' });
    this.validationError = page.locator('.govuk-error-summary').first();
  }

  /**
   * Wait for the PRSExemptionRegister page to load
   */
  private async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Contact Details Page',
      {
        firstNameInput: this.firstNameInput,
        lastNameInput: this.lastNameInput,
        continueButton: this.continueButton
      }
    );
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
