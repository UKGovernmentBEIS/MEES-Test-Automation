import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';

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
    await this.page.goto('https://desnz-gm--prseqa.sandbox.my.site.com/PRSExemptionsRegister');
    await this.verifyOnPage();
  }

  /**   
   * Verify user is on the PRSE Home page
   */
  async verifyOnPage(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.startNowButton?.waitFor();
  }

  /**
   * Click the Start Now button
   */
  async clickStartNow(): Promise<SignInOrCreatePage> {
    await ElementUtilities.clickElement(this.startNowButton!);
    return new SignInOrCreatePage(this.page);
  }
}
