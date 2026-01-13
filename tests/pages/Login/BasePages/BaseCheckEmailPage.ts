import { Page, Locator } from '@playwright/test';

export abstract class BaseCheckEmailPage {
  protected page: Page
  readonly pageContext: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageContext = page.locator('#main-content');
  }

    // Wait for the Check Email page to load
    abstract waitForPageToLoad(): Promise<void>;
}