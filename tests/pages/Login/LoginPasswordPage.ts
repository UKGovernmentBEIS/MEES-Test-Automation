import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities.ts';
import { PRSE_HaveRegisteredExemptionPage } from '../ExemptionRegister/PRSE_HaveRegisteredExemptionPage.ts';

export class PRSE_LoginPasswordPage {
  private readonly page: Page;
  private readonly passwordInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Enter password
   * @param password The password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await ElementUtilities.fillText(this.passwordInput, password);
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<PRSE_HaveRegisteredExemptionPage> {
    await ElementUtilities.clickElement(this.continueButton);
    return new PRSE_HaveRegisteredExemptionPage(this.page);
  }

  /**
   * Enter password and continue to exemption register page
   * @param password The password to enter
   * @returns PRSE_HaveRegisteredExemptionPage instance after successful login
   */
  async enterPasswordAndContinue(password: string): Promise<PRSE_HaveRegisteredExemptionPage> {
    await this.enterPassword(password);
    return await this.clickContinue();
  }
}
