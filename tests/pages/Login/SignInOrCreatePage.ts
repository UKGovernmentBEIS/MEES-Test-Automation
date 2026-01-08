import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PRSE_LoginEmailPage } from './LoginEmailPage';

export class SignInOrCreatePage {
  private readonly page: Page;
  private readonly signInButton: Locator;
  readonly pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.pageContext = page.locator('#main-content')
  }

  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Sign In Or Create Page',
      { signInButton: this.signInButton }
    );
  }

  async clickSignIn(): Promise<PRSE_LoginEmailPage> {
    await ElementUtilities.clickElement(this.signInButton);
    const loginEmailPage = new PRSE_LoginEmailPage(this.page);
    await loginEmailPage.waitForPageToLoad();
    return loginEmailPage;
  }
}
