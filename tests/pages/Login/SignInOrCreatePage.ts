import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { SignUpEmailPage } from './SignUpEmailPage';
import { LogInEmailPage } from './LoginEmailPage';

export class SignInOrCreatePage {
  private readonly page: Page;
  private readonly signInButton: Locator;
  private readonly createAnAccountButton: Locator;
  readonly pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.createAnAccountButton = page.getByRole('button', { name: 'Create your GOV.UK One Login' });
    this.pageContext = page.locator('#main-content')
  }

  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Sign In Or Create Page',
      { signInButton: this.signInButton,
        createAnAccountButton: this.createAnAccountButton
       }
    );
  }

  async clickSignIn(): Promise<LogInEmailPage> {
    await ElementUtilities.clickElement(this.signInButton);
    const loginEmailPage = new LogInEmailPage(this.page);
    await loginEmailPage.waitForPageToLoad();
    return loginEmailPage;
  }

  async clickCreateAnAccountLink(): Promise<SignUpEmailPage> {
    await ElementUtilities.clickElement(this.createAnAccountButton);
    const signUpEmailPage = new SignUpEmailPage(this.page);
    await signUpEmailPage.waitForPageToLoad();
    return signUpEmailPage;
  }
}