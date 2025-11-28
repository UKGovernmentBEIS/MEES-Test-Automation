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
}
