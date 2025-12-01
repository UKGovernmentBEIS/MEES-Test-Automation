import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginEmailPage } from './LoginEmailPage';

export class SignInOrCreatePage {
  readonly page: Page;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.page.waitForLoadState('domcontentloaded');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async waitForPageToLoad(): Promise<void> {
    await this.signInButton.waitFor();
  }

  async clickSignIn(): Promise<PRSE_LoginEmailPage> {
    await ElementUtilities.clickElement(this.signInButton);
    return new PRSE_LoginEmailPage(this.page);
  }
}
