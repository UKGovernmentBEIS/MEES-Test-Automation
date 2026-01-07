import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities.ts';
import { LandingPage } from '../Compliance/LandingPage.ts';

export class PRSE_LoginPasswordPage {
  private readonly page: Page;
  private readonly passwordInput: Locator;
  private readonly continueButton: Locator;
  private readonly instructionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.instructionText = page.getByText('Enter your password');
  }

  // Context locators for verification
  getContextLocators(): Locator[] {
    return [
      this.instructionText
    ];
  }

  // Wait for the Login Password page to load
  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Login Password Page',
      { passwordInput: this.passwordInput, continueButton: this.continueButton, instructionText: this.instructionText }
    );
  }

  /**
   * Enter password
   * @param password The password to enter
   */
  private async enterPassword(password: string): Promise<void> {
    await ElementUtilities.fillText(this.passwordInput, password);
  }

  /**
   * Click the continue button
   */
  private async clickContinue(): Promise<LandingPage> {
    await ElementUtilities.clickElement(this.continueButton);
    const landingPage = new LandingPage(this.page);
    await landingPage.waitForPageToLoad();
    return landingPage;
  }

  /**
   * Enter password and continue to exemption register page
   * @param password The password to enter
   * @returns LandingPage instance after successful login
   */
  async enterPasswordAndContinue(password: string): Promise<LandingPage> {
    await this.enterPassword(password);
    return await this.clickContinue();
  }
}
