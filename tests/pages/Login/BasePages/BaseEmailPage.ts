import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';

export abstract class BaseEmailPage {
  protected readonly page: Page;
  protected emailInput: Locator;
  protected continueButton: Locator;
  pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.pageContext = page.locator('#main-content');
  }

  async enterEmail(email: string): Promise<void> {
    await ElementUtilities.fillText(this.emailInput, email);
  }

  async clickContinue(): Promise<void> {
    await ElementUtilities.clickElement(this.continueButton);
  }

  abstract waitForPageToLoad(): Promise<void>;

  abstract enterEmailAndContinue(email: string): Promise<any>;
}