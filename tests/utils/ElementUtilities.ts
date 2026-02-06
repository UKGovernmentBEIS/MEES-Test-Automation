import { Page, Locator } from '@playwright/test';

export class ElementUtilities {
  /**
   * Clicks on an element using the provided locator
   * @param locator The Playwright locator for the element
   * @param timeout Optional timeout in milliseconds (defaults to Playwright's global config)
   */
  static async clickElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.click({ timeout });
  }

  static async checkElement(locator: Locator, timeout?: number): Promise<void> {
    // Only check if not already checked
    if (await locator.isChecked()) {
      return;
    }
    // Check the element
    await locator.check({ timeout });
    // Verify it is checked
    if (!(await locator.isChecked())) {
      throw new Error('Failed to check the element.');
    }
  }

  /**
   * Fills text into an input field and verifies the value was set correctly
   * @param locator The Playwright locator for the element
   * @param text The text to fill
   * @param timeout Optional timeout in milliseconds (defaults to Playwright's global config)
   */
  static async fillText(locator: Locator, text: string, timeout?: number): Promise<void> {
    await locator.fill(text, { timeout });
    const actualValue = await locator.inputValue();
    if (actualValue !== text) {
      throw new Error(`Failed to fill text. Expected: "${text}", but got: "${actualValue}"`);
    }
  }

  /**
   * Waits for an element to be visible
   * @param locator The Playwright locator for the element
   * @param timeout Optional timeout in milliseconds (defaults to Playwright's global config)
   */
  static async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits for a page to load by checking the page load state and waiting for key locators
   * Provides informative error messages if the page fails to load
   * @param page The Playwright page object
   * @param pageName The name of the page (for error messages)
   * @param locators An object containing locator names and their Locator objects to wait for
   * @param timeout Optional timeout in milliseconds (defaults to Playwright's global config)
   * @param waitForLoadState Optional load state to wait for (defaults to 'domcontentloaded')
   * @param locatorState Optional state to wait for ('visible' or 'attached'). Defaults to 'attached' for more robust page load validation
   * @throws Error with detailed information about which locators failed to load
   */
  static async waitForPageToLoad(
    page: Page,
    pageName: string,
    locators: Record<string, Locator>,
    timeout?: number,
    waitForLoadState: 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
    locatorState: 'visible' | 'attached' = 'attached'
  ): Promise<void> {
    // First wait for key locators to be in the desired state
    // This ensures all redirects have completed and we're on the correct final page
    await this.waitForLocatorsToBeInState(pageName, locators, locatorState, timeout);

    // Then wait for the DOM to be fully loaded on the final page
    await page.waitForLoadState(waitForLoadState);
  }

  private static async waitForLocatorsToBeInState(
    pageName: string, 
    locators: Record<string, Locator>, 
    state: 'visible' | 'attached',
    timeout?: number
  ) {
    const failedLocators: string[] = [];
    for (const [locatorName, locator] of Object.entries(locators)) {
      try {
        await locator.waitFor({ state, timeout: 5000 });
      } catch (error) {
        failedLocators.push(locatorName);
      }
    }

    // If any locators failed, throw an informative error
    if (failedLocators.length > 0) {
      throw new Error(
        `Page '${pageName}' did not load correctly. The following elements failed to appear: ${failedLocators.join(', ')}`
      );
    }
  }
}
