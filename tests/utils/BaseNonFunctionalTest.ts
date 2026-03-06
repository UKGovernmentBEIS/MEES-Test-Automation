import { expect, Page, TestInfo, Locator } from '@playwright/test';
import { AccessibilityUtilities } from './AccessibilityUtilities';
import { TestAnnotations, TestType, PageName } from './TestTypes';

/**
 * Base class for non-functional tests that provides common functionality
 * for accessibility testing and context verification
 */
export class BaseNonFunctionalTest {
  protected readonly page: Page;
  protected readonly testInfo: TestInfo;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  /**
   * Adds test annotations for page and test types
   * @param pageName - The name of the page being tested
   * @param testTypes - Array of test types (defaults to ACCESSIBILITY and CONTEXT_VERIFICATION)
   */
  public addTestAnnotations(
    pageName: PageName | string,
    testTypes: TestType[] = [TestType.ACCESSIBILITY, TestType.CONTEXT_VERIFICATION]
  ): void {
    this.testInfo.annotations.push(TestAnnotations.page(pageName));
    testTypes.forEach(testType => {
      this.testInfo.annotations.push(TestAnnotations.testType(testType));
    });
  }

  /**
   * Performs context verification using aria snapshots for an array of locators
   * @param locators - Array of locators to verify
   */
  public async verifyContextWithLocators(locators: Locator[]): Promise<void> {
    for (const locator of locators) {
      await expect(locator).toMatchAriaSnapshot();
    }
  }

  /**
   * Performs accessibility testing on the current page
   * @param pageName - The name of the page being tested
   */
  public async verifyAccessibility(
    pageName: PageName
  ): Promise<void> {
    const results = await AccessibilityUtilities.analyzeAccessibility(this.page);
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(
      criticalViolations,
      `${pageName} has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`
    ).toBe(false);
  }
}