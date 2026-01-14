import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { LandingPage } from './Compliance/LandingPage';

export class HomePage {
  private readonly page: Page;
  private readonly startNowButton: Locator;
  private readonly generalInstructionsText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
    this.generalInstructionsText = this.page.locator('uxgovuk-gov-markup-text');
  }

  /**
   * Get the general instructions text locator for visual regression testing
   * @returns Locator for the general instructions text element
   */
  getGeneralInstructionsTextLocator(): Locator {
    return this.generalInstructionsText;
  }

  /**
   * Navigate to the MEES page
   */
  async navigate(): Promise<void> {
    await this.page.goto('');
    await this.waitForPageToLoad();
  }

  /**   
   * Wait for the MEES Home page to load
   */
  private async waitForPageToLoad(): Promise<void> {
    await ElementUtilities.waitForPageToLoad(
      this.page,
      'Home Page',
      { startNowButton: this.startNowButton, generalInstructionsText: this.generalInstructionsText }
    );
  }

  async isDisplayed(): Promise<boolean> {
    return await this.startNowButton.isVisible() && await this.generalInstructionsText.isVisible();
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
  async clickStartNow_AuthenticatedUser(): Promise<LandingPage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    const landingPage = new LandingPage(this.page);
    await landingPage.waitForPageToLoad();
    return landingPage;
  }
}
