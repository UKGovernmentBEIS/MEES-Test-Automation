# Non-Functional Testing Guide: Context Verification

This guide explains how to write automated context verification tests to ensure pages load correctly with expected content, structure, and behavior patterns.

## Overview

Context verification tests validate that pages display the correct content and maintain expected DOM structure across different test runs. These tests work alongside accessibility testing to provide comprehensive page validation in the `non-functional` project.

**Context Verification includes:**
- **DOM Structure Validation:** Verify key elements are present and correctly positioned
- **Content Verification:** Check headings, text content, and labels match expectations
- **Aria Structure:** Validate semantic structure through aria snapshots

## Quick Start

### Basic Context Verification Test

Each page class implements a `getContextLocators()` method. Use it to verify aria structure of page elements:

```typescript
// Context Verification: Verify presence of key elements on the page
const contextLocatorArray = yourPage.getContextLocators();
for (let i = 0; i < contextLocatorArray.length; i++) {
    const locator = contextLocatorArray[i];
    await expect(locator).toMatchAriaSnapshot(`-page-element-${i}.aria.yml`);
}
```

### Running Context Verification Tests

```bash
# Run all non-functional tests (includes context verification)
npx playwright test --project=non-functional

# Run specific context verification test
npx playwright test PageTests --project=non-functional -g "context"
```

## Page Object Pattern for Context Verification

### Implementing `getContextLocators()` Method

Every page object should implement a `getContextLocators()` method that returns critical UI elements for verification:

```typescript
/**
 * Returns critical UI elements for context verification
 * Order matters - should be consistent across test runs
 */
getContextLocators(): Locator[] {
  return [
    this.mainHeading,
    this.navigationMenu,
    this.primaryButton,
    this.contentArea
  ];
}