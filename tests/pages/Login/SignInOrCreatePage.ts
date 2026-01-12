import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { LogInEmailPage } from './LoginEmailPage';
import { RegistrationEmailPage } from './RegistrationEmailPage';

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

  async clickCreateAnAccountLink(): Promise<RegistrationEmailPage> {
    await ElementUtilities.clickElement(this.createAnAccountButton);
    const registrationEmailPage = new RegistrationEmailPage(this.page);
    await registrationEmailPage.waitForPageToLoad();
    return registrationEmailPage;
  }
}