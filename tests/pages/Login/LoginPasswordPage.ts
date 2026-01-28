import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { HomePage } from '../Compliance/HomePage';
import { CheckEmailResetPasswordPage } from './CheckEmailResetPasswordPage';
import { NoAccessPage } from '../Compliance/NoAccessPage';

export class LoginPasswordPage {
  private readonly page: Page;
  private passwordInput: Locator;
  private continueButton: Locator;
  private forgotPasswordLink: Locator;
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
   * @returns HomePage instance after successful login
   */
  async enterPasswordAndContinueToComplianceLandingPage(password: string): Promise<HomePage> {
    await this.enterPassword(password);
    await this.clickContinue();
    const homePage = new HomePage(this.page);
    await homePage.waitForPageToLoad();
    return homePage;
  }

  /**
   * Enter password and continue to No Access page
   * @param password The password to enter
   * @returns NoAccessPage instance after navigation
   */
  async enterPasswordAndContinueToNoAccessPage(password: string): Promise<NoAccessPage> {
    await this.enterPassword(password);
    await this.clickContinue();
    const noAccessPage = new NoAccessPage(this.page);
    await noAccessPage.waitForPageToLoad();
    return noAccessPage;
  }
}