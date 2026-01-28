import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { HomePage } from './Compliance/HomePage';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  private readonly startNowButton: Locator;
  private readonly pageContext: Locator;

  constructor(page: Page) {
    super(page);
    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
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
      { startNowButton: this.startNowButton, pageContext: this.pageContext }
    );
  }

  async isDisplayed(): Promise<boolean> {
    return await this.startNowButton.isVisible() && await this.pageContext.isVisible();
  }

  /**
   * Not Authenticated User - Click Start Now button to navigate to Sign In Or Create Account page
   */
  async clickStartNow_NotAuthenticatedUser(): Promise<SignInOrCreatePage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    const signInOrCreatePage = new SignInOrCreatePage(this.page);
    await signInOrCreatePage.waitForPageToLoad();
    return signInOrCreatePage;
  }

  // Authenticated User - Click Start Now button to navigate to Compliance Landing Page
  async clickStartNow_AuthenticatedUser(): Promise<HomePage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    const homePage = new HomePage(this.page);
    await homePage.waitForPageToLoad();
    return homePage;
  }
}