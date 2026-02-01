# Context Verification Guide

## What It Is

Automated validation that pages load correctly with expected content, structure, and behavior patterns. Works alongside accessibility testing for comprehensive page validation.

## What It Includes

- **DOM Structure**: Key elements present and correctly positioned
- **Content Verification**: Headings, text, and labels match expectations  
- **Aria Structure**: Semantic structure validation through aria snapshots
- **URL Patterns**: Correct page routing and navigation

## Quick Start

```typescript
// Basic context verification using page object
const contextLocatorArray = yourPage.getContextLocators();
for (let i = 0; i < contextLocatorArray.length; i++) {
    const locator = contextLocatorArray[i];
    await expect(locator).toMatchAriaSnapshot(`-page-element-${i}.aria.yml`);
}
```

```bash
# Run context verification tests
npx playwright test --project=non-functional -g "context"
```

## Page Object Pattern

Every page object implements `getContextLocators()` method returning critical UI elements:

```typescript
/**
 * Returns critical UI elements for context verification
 * Order matters - must be consistent across test runs
 */
getContextLocators(): Locator[] {
  return [
    this.mainHeading,
    this.navigationMenu,
    this.primaryButton,
    this.contentArea
  ];
}
```

## Test Pattern

```typescript
import { test, expect } from '../../fixtures/authFixtures';
import { TestType, PageName, TestAnnotations } from '../../utils/TestTypes';

test.describe('Page Context Verification', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push(
      TestAnnotations.testType(TestType.CONTEXT_VERIFICATION)
    );
  });

  test('Page structure validation', async ({ page }, testInfo) => {
    testInfo.annotations.push(TestAnnotations.page(PageName.YOUR_PAGE));

    // Navigate to page
    const yourPage = new YourPage(page);
    await yourPage.navigate();

    // Verify URL pattern
    await expect(page).toHaveURL(/expected-pattern/);

    // Verify content structure
    const contextLocators = yourPage.getContextLocators();
    for (let i = 0; i < contextLocators.length; i++) {
      await expect(contextLocators[i]).toMatchAriaSnapshot(`your-page-element-${i}.aria.yml`);
    }
  });
});
```

## Running Tests

```bash
# Run all context verification tests
npx playwright test --project=non-functional

# Run specific page context tests
npx playwright test PageTests --project=non-functional -g "context"

# Generate/update snapshots
npx playwright test --project=non-functional --update-snapshots
```