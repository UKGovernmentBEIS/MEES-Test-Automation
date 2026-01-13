import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { LandingPage } from '../../Compliance/LandingPage';
import { CheckEmailResetPasswordPage } from '../CheckEmailResetPasswordPage';

export abstract class BasePasswordPage {
  protected readonly page: Page;
  protected passwordInput: Locator;
  protected continueButton: Locator;
  protected forgotPasswordLink: Locator;
  pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'I’ve forgotten my password' });
    this.pageContext = page.locator('#main-content');
  }

  async enterPassword(password: string): Promise<void> {
    await ElementUtilities.fillText(this.passwordInput, password);
  }

  async clickContinue(): Promise<void> {
    await ElementUtilities.clickElement(this.continueButton);
  }

  async clickForgotPasswordLink(): Promise<CheckEmailResetPasswordPage> {
    await ElementUtilities.clickElement(this.forgotPasswordLink);
    const checkEmailResetPasswordPage = new CheckEmailResetPasswordPage(this.page);
    await checkEmailResetPasswordPage.waitForPageToLoad();
    return checkEmailResetPasswordPage;
  }

  // Wait for the Login Password page to load
  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Login Password Page',
      { passwordInput: this.passwordInput, continueButton: this.continueButton }
    );
  }

  /**
   * Enter password and continue to exemption register page
   * @param password The password to enter
   * @returns LandingPage instance after successful login
   */
  async enterPasswordAndContinue(password: string): Promise<LandingPage> {
    await this.enterPassword(password);
    await this.clickContinue();
    const landingPage = new LandingPage(this.page);
    await landingPage.waitForPageToLoad();
    return landingPage;
  }
}