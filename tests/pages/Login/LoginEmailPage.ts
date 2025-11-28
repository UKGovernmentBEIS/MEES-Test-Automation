import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginPasswordPage } from './LoginPasswordPage';

export class PRSE_LoginEmailPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Enter email address
   * @param email The email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    await ElementUtilities.fillText(this.emailInput, email);
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<PRSE_LoginPasswordPage> {
    await ElementUtilities.clickElement(this.continueButton);
    return new PRSE_LoginPasswordPage(this.page);
  }

  /**
   * Enter email and continue to password page
   * @param email The email address to enter
   * @returns PRSE_LoginPasswordPage instance
   */
  async enterEmailAndContinue(email: string): Promise<PRSE_LoginPasswordPage> {
    await this.enterEmail(email);
    return await this.clickContinue();
  }
}
