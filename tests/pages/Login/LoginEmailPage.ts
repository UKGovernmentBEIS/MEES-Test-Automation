import { Page } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { LoginPasswordPage } from './LoginPasswordPage';
import { BaseEmailPage } from './BasePages/BaseEmailPage';

export class LogInEmailPage extends BaseEmailPage {

  constructor(page: Page) {
    super(page);
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
   * Enter email and continue to password page
   * @param email The email address to enter
   * @returns LoginPasswordPage instance
   */
  async enterEmailAndContinue(email: string): Promise<LoginPasswordPage> {
    await this.enterEmail(email);
    await this.clickContinue();
    const loginPasswordPage = new LoginPasswordPage(this.page);
    await loginPasswordPage.waitForPageToLoad();
    return loginPasswordPage;
  }
}
