import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginEmailPage } from './LoginEmailPage';

export class SignInOrCreatePage {
  private readonly page: Page;
  private readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  private async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Sign In Or Create Page',
      { signInButton: this.signInButton }
    );
  }

  async clickSignIn(): Promise<PRSE_LoginEmailPage> {
    await ElementUtilities.clickElement(this.signInButton);
    return new PRSE_LoginEmailPage(this.page);
  }
}
