import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class CheckEmailPage {
  private readonly page: Page
  readonly pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContext = page.locator('#main-content');
  }

    // Wait for the Check Email page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Check Email Page',
            { pageContext: this.pageContext }
        );
    }
}