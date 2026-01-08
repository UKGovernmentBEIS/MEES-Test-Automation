import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginPasswordPage } from './LoginPasswordPage';

export class PRSE_LoginEmailPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly continueButton: Locator;
  readonly pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.pageContext = page.locator('#main-content');
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
      { emailInput: this.emailInput, continueButton: this.continueButton }
    );
  }

  /**
   * Click the continue button
   */
  async clickContinue(): Promise<void> {
    await ElementUtilities.clickElement(this.continueButton);
  }

  /**
   * Enter email and continue to password page
   * @param email The email address to enter
   * @returns PRSE_LoginPasswordPage instance
   */
  async enterEmailAndContinue(email: string): Promise<PRSE_LoginPasswordPage> {
    await this.enterEmail(email);
    await this.clickContinue();
    const loginPasswordPage = new PRSE_LoginPasswordPage(this.page);
    await loginPasswordPage.waitForPageToLoad();
    return loginPasswordPage;
  }
}
