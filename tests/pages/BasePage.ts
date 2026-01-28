import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  private static readonly globalConsoleErrors: Set<string> = new Set();
  private static consoleListenerAttached: boolean = false;
  readonly pageFooter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageFooter = this.page.locator('c-gds-footer').getByRole('contentinfo');
    
    // Clear previous page errors for true page isolation
    BasePage.globalConsoleErrors.clear();
    
    // Set up global console error listener once
    this.setupGlobalConsoleErrorListener();
  }

  /**
   * Set up global console error listener (only once across all page instances)
   */
  private setupGlobalConsoleErrorListener(): void {
    if (BasePage.consoleListenerAttached) {
      return; // Prevent multiple listeners
    }
    
    this.page.on('console', msg => {
      console.log(`Console message: ${msg.type()} - ${msg.text()}`);
      if (msg.type() === 'error') {
        // Only add actual error messages, not resource loading messages
        const errorText = msg.text();
        if (!errorText.includes('CSS file loaded')) {
          BasePage.globalConsoleErrors.add(errorText);
        }
      }
    });
    
    BasePage.consoleListenerAttached = true;
  }

  /**
   * Get console errors for this page
   * @returns Array of unique console error messages
   */
  public getConsoleErrors(): string[] {
    return Array.from(BasePage.globalConsoleErrors);
  }

  /**
   * Clear captured console errors manually (if needed)
   */
  public clearConsoleErrors(): void {
    BasePage.globalConsoleErrors.clear();
  }

  /**
   * Check if the page is currently displayed (to be implemented by subclasses)
   */
  abstract isDisplayed(): Promise<boolean>;

  /**
   * Get the main page context locator (to be implemented by subclasses)
   */
  abstract getPageContextLocator(): Locator;

  /**
   * Wait for the page to load (to be implemented by subclasses)
   */
  abstract waitForPageToLoad(): Promise<void>;
}