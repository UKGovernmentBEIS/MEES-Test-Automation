import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { HomePage } from './Compliance/HomePage';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  private readonly signInButton: Locator;
  private readonly pageContext: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
    this.pageContext = page.locator('#main-content');
  }

  /**
   * Get the page context locator for visual regression testing
   * @returns Locator for the page context element
   */
  getPageContextLocator(): Locator {
    return this.pageContext;
  }

  /**
   * Navigate to the MEES page
   */
  async navigate(): Promise<void> {
    await this.page.goto('');
    await this.waitForPageToLoad();
  }

  /**   
   * Wait for the MEES Landing page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Landing Page',
      { signInButton: this.signInButton, pageContext: this.pageContext }
    );
  }

  async isDisplayed(): Promise<boolean> {
    return await this.signInButton.isVisible() && await this.pageContext.isVisible();
  }

  /**
   * Not Authenticated User - Click Sign In button to navigate to Sign In Or Create Account page
   */
  async clickSignIn_NotAuthenticatedUser(): Promise<SignInOrCreatePage> {
    await ElementUtilities.clickElement(this.signInButton!);
    const signInOrCreatePage = new SignInOrCreatePage(this.page);
    await signInOrCreatePage.waitForPageToLoad();
    return signInOrCreatePage;
  }

  // Authenticated User - Click Sign In button to navigate to Compliance Landing Page
  async clickSignIn_AuthenticatedUser(): Promise<HomePage> {
    await ElementUtilities.clickElement(this.signInButton!);
    const homePage = new HomePage(this.page);
    await homePage.waitForPageToLoad();
    return homePage;
  }
}