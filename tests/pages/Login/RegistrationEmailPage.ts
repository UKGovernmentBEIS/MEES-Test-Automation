import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { CheckEmailPage } from './CheckEmailPage';
import { BaseEmailPage } from './BasePages/BaseEmailPage';

export class RegistrationEmailPage extends BaseEmailPage {
  private readonly termsAndConditionsText: Locator;
  private readonly termsAndConditionsLink: Locator;
  private readonly privacyNoticeLink: Locator;

  constructor(page: Page) {
    super(page);
    this.termsAndConditionsText = page.locator('text=Agree to the GOV.UK One Login terms and conditions');
    this.termsAndConditionsLink = page.getByRole('link', { name: 'terms and conditions (opens in a new tab)' });
    this.privacyNoticeLink = page.getByRole('link', { name: 'privacy notice (opens in a new tab)' });
  }

  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Sign Up Email Page',
      { 
        emailInput: this.emailInput, 
        continueButton: this.continueButton,
        termsAndConditionsText: this.termsAndConditionsText
      }
    );
  }

  async clickTermsAndConditions(): Promise<void> {
    await ElementUtilities.clickElement(this.termsAndConditionsLink);
  }

  async clickPrivacyNotice(): Promise<void> {
    await ElementUtilities.clickElement(this.privacyNoticeLink);
  }

  /**
     * Enter email and continue to password page
     * @param email The email address to enter
     * @returns SignUpPasswordPage instance
     */
    async enterEmailAndContinue(email: string): Promise<CheckEmailPage> {
      await this.enterEmail(email);
      await this.clickContinue();
      const checkEmailPage = new CheckEmailPage(this.page);
      await checkEmailPage.waitForPageToLoad();
      return checkEmailPage;
    }
}