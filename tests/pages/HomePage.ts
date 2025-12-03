import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';
import { PRSE_HaveRegisteredExemptionPage } from './ExemptionRegister/PRSE_HaveRegisteredExemptionPage';

export class HomePage {
  readonly page: Page;
  readonly startNowButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startNowButton = this.page.getByRole('button', { name: 'Start now' });
  }

  /**
   * Navigate to the PRSE Exemptions Register page
   */
  async navigate(): Promise<void> {
    await this.page.goto('');
    await this.waitForPageToLoad();
  }

  /**   
   * Wait for the PRSE Home page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.startNowButton.waitFor();
  }

  /**
   * Not Authenticated User - Click Start Now button to navigate to Sign In Or Create Account page
   */
  async clickStartNow_NotAuthenticatedUser(): Promise<SignInOrCreatePage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    return new SignInOrCreatePage(this.page);
  }

  /**
   * Authenticated User - Click Start Now button to navigate to Have You Registered Exemptions page
   */
  async clickStartNow_AuthenticatedUser(): Promise<PRSE_HaveRegisteredExemptionPage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('domcontentloaded');
    
    const haveRegisteredPage = new PRSE_HaveRegisteredExemptionPage(this.page);
    await haveRegisteredPage.waitForPageToLoad();
    
    return haveRegisteredPage;
  }
}
