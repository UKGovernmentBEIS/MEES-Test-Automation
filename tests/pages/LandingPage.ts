import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { HomePage } from './Compliance/HomePage';
import { BasePage } from './BasePage';
import { accounts, resolveCredentials, performLogin, saveAuthState } from '../utils/AuthUtils';

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
    
    // Wait a moment to see where we land after clicking
    await this.page.waitForTimeout(2000);
    
    const currentUrl = this.page.url();
    console.log(`[LandingPage] After clicking Sign In, landed on: ${currentUrl}`);
    
    // Check if we were redirected to GOV.UK login (authentication lost)
    if (currentUrl.includes('gov.uk') || currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log(`[LandingPage] Authentication lost - redirected to login. Performing re-authentication...`);
      
      // Get worker index from test info if available, otherwise use 0
      let workerIndex = 0;
      try {
        // Try to get worker index from Playwright's test info
        const testInfo = (global as any).__playwright_test_info__;
        if (testInfo) {
          workerIndex = testInfo.parallelIndex;
        }
      } catch (e) {
        // Fallback to worker 0 if we can't determine worker index
      }
      
      console.log(`[LandingPage] Re-authenticating using Worker ${workerIndex} credentials...`);
      
      // Get the account for this worker
      const account = accounts[workerIndex];
      if (!account) {
        throw new Error(`No account available for worker ${workerIndex}`);
      }
      
      // Resolve credentials and perform login
      const { email, password } = resolveCredentials(account);
      await performLogin(this.page, email, password);
      
      // Save the new authentication state so subsequent tests can use it
      console.log(`[LandingPage] Saving refreshed authentication state for Worker ${workerIndex}...`);
      await saveAuthState(this.page, workerIndex);
      
      console.log(`[LandingPage] Re-authentication completed successfully`);
    }
    
    // Now create and wait for HomePage to load
    const homePage = new HomePage(this.page);
    await homePage.waitForPageToLoad();
    return homePage;
  }
}