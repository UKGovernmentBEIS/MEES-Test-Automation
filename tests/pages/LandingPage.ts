import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { HomePage } from './Compliance/HomePage';
import { BasePage } from './BasePage';
import { reAuthenticate } from '../utils/AuthUtils';

export class LandingPage extends BasePage {
  private readonly signInButton: Locator;
  private readonly pageContext: Locator;
  private readonly registrationLink: Locator;
  private readonly requestSupportLink: Locator;
  private readonly reviewExemptionsLink: Locator;
  private readonly findEnergyCertificateLink: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
    this.pageContext = page.locator('#main-content');
    this.registrationLink = page.getByRole('link', { name: /Microsoft Form/ });
    this.requestSupportLink = page.getByRole('link', { name: 'Request support' });
    this.reviewExemptionsLink = page.getByRole('link', { name: 'Review exemptions for private rented sector energy standards' });
    this.findEnergyCertificateLink = page.getByRole('link', { name: 'Find an energy certificate' });
  }

  /**
   * Get the page context locator for visual regression testing
   * @returns Locator for the page context element
   */
  async getPageContextLocator(): Promise<Locator[]> {
    return [this.pageContext, this.signInButton];
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

  async getRegistrationLinkHref(): Promise<string | null> {
    return this.registrationLink.getAttribute('href');
  }

  async registrationLinkOpensInNewTab(): Promise<boolean> {
    const target = await this.registrationLink.getAttribute('target');
    return target === '_blank';
  }

  async getRequestSupportLinkHref(): Promise<string | null> {
    return this.requestSupportLink.getAttribute('href');
  }

  async getReviewExemptionsLinkHref(): Promise<string | null> {
    return this.reviewExemptionsLink.getAttribute('href');
  }

  async getReviewExemptionsLinkText(): Promise<string> {
    return this.reviewExemptionsLink.innerText();
  }

  async getFindEnergyCertificateLinkHref(): Promise<string | null> {
    return this.findEnergyCertificateLink.getAttribute('href');
  }

  async getFindEnergyCertificateLinkText(): Promise<string> {
    return this.findEnergyCertificateLink.innerText();
  }

  // Authenticated User - Click Sign In button to navigate to Compliance Landing Page
  async clickSignIn_AuthenticatedUser(): Promise<HomePage> {
    await ElementUtilities.clickElement(this.signInButton!);
    
    // Wait a moment to see where we land after clicking
    await this.page.waitForTimeout(2000);
    
    const currentUrl = this.page.url();
    console.log(`[LandingPage] After clicking Sign In, landed on: ${currentUrl}`);
    
    // Check if we were redirected to GOV.UK login (authentication lost)
    if (currentUrl.includes('gov.uk') || currentUrl.includes('login') || currentUrl.includes('signin')) {
      await reAuthenticate(this.page);
    }
    
    // Now create and wait for HomePage to load
    const homePage = new HomePage(this.page);
    await homePage.waitForPageToLoad();
    return homePage;
  }
}