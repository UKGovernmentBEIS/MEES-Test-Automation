import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginPasswordPage } from './LoginPasswordPage';

export class PRSE_LoginEmailPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly continueButton: Locator;
  private readonly instructionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.instructionText = page.getByText('Enter your email address to')
  }

  getContextLocators(): Locator[] {
    return [
      this.instructionText
    ];
  }

  /**
   * Enter email address
   * @param email The email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    await ElementUtilities.fillText(this.emailInput, email);
  }

  /**
   * Wait for the Login Email page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Login Email Page',
      { emailInput: this.emailInput, continueButton: this.continueButton, instructionText: this.instructionText }
    );
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<PRSE_LoginPasswordPage> {
    await ElementUtilities.clickElement(this.continueButton);
    const loginPasswordPage = new PRSE_LoginPasswordPage(this.page);
    await loginPasswordPage.waitForPageToLoad();
    return loginPasswordPage;
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
