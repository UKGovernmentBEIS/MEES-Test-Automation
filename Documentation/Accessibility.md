# Accessibility Testing Guide

This guide explains how to write automated accessibility tests using the `AccessibilityUtilities` class.

## Overview

The framework uses **axe-core** integrated with Playwright to automatically detect accessibility violations against WCAG 2.1 AA standards.

## WCAG 2.1 AA Coverage

### ✅ Fully Automatable with axe-core

| **SC** | **Description** | **axe-core Coverage** |
|--------|-----------------|------------------------|
| 1.1.1 | Non-text Content (alt text for images/icons) | Yes |
| 1.3.1 | Info and Relationships (semantic structure, ARIA roles) | Yes |
| 1.3.2 | Meaningful Sequence (DOM order) | Yes |
| 1.4.3 | Contrast (Minimum) | Yes |
| 1.4.6 | Contrast (Enhanced) | Yes |
| 1.4.10 | Reflow (viewport zoom) | Yes |
| 2.4.4 | Link Purpose (In Context) | Yes |
| 2.4.6 | Headings and Labels | Yes |
| 3.1.1 | Language of Page | Yes |
| 3.1.2 | Language of Parts | Yes |
| 4.1.1 | Parsing (valid HTML, no duplicate IDs) | Yes |
| 4.1.2 | Name, Role, Value (ARIA validity) | Yes |
| 4.1.3 | Status Messages (aria-live regions) | Partial |

### ⚠️ Hybrid (Automation + Manual/Scripted)

| **SC** | **Description** | **Why Hybrid?** |
|--------|-----------------|-----------------|
| 2.1.1 | Keyboard | Axe flags tabindex issues; full operability needs scripted tests |
| 2.1.2 | No Keyboard Trap | Axe detects some traps; confirm with Playwright navigation |
| 2.4.3 | Focus Order | Axe checks hidden focusable elements; logical order needs manual/scripted validation |
| 2.4.7 | Focus Visible | Axe cannot verify visual styling; manual visual check required |
| 3.3.1 | Error Identification | Axe checks missing labels; verify error messages appear and are announced |
| 1.4.11 | Non-Text Contrast | Axe partially checks; manual confirmation for custom UI components |
| 1.4.12 | Text Spacing | Requires manual CSS inspection |
| 1.4.13 | Content on Hover/Focus | Axe flags some issues; manual check for dismissibility and persistence |

### 👀 Manual Only

| **SC** | **Description** |
|--------|-----------------|
| 1.2.x | Time-based Media (captions, audio descriptions) |
| 1.3.4 | Orientation (support portrait/landscape) |
| 1.3.5 | Identify Input Purpose |
| 2.2.x | Timing Adjustable |
| 2.4.1 | Bypass Blocks (skip links, landmarks) |
| 2.5.x | Pointer Gestures, Target Size |
| 3.2.x | Predictable (on focus/input behavior consistency) |
| 3.3.4 | Error Prevention (Legal, Financial, Data) |
| Screen Reader Compatibility | JAWS/NVDA tests for announcement order, verbosity, dynamic updates |

## Quick Start

### 1. Import Required Modules

```typescript
import { test, expect } from '../../../fixtures/authFixtures';
import { AccessibilityUtilities } from '../../../utils/AccessibilityUtilities';
import { HomePage } from '../../../pages/HomePage';
```

### 2. Basic Accessibility Test

```typescript
test('Page should have no critical accessibility violations', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();

  // Analyze accessibility
  const results = await AccessibilityUtilities.analyzeAccessibility(page);

  // Assert no critical violations
  const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
  expect(criticalViolations, `Page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
});
```

## Available Methods

### `analyzeAccessibility(page, options?)`

Analyzes the current page for accessibility violations using axe-core.

**Parameters:**
- `page: Page` - The Playwright page object
- `options?` - Optional configuration:
  - `includeTags?: string[]` - Only run rules with these tags (e.g., `['wcag2a', 'wcag2aa']`)
  - `excludeTags?: string[]` - Exclude rules with these tags
  - `disableRules?: string[]` - Disable specific rules by ID

**Returns:** `Promise<AccessibilityResult>`
- `violations: AccessibilityViolation[]` - Array of violations found
- `passes: number` - Number of passed checks
- `incomplete: number` - Number of incomplete checks
- `violationCount: number` - Total violations

**Example:**
```typescript
// Basic usage
const results = await AccessibilityUtilities.analyzeAccessibility(page);

// With options
const results = await AccessibilityUtilities.analyzeAccessibility(page, {
  includeTags: ['wcag2aa'],
  disableRules: ['color-contrast'] // Disable specific rule if needed
});
```

### `hasCriticalViolations(violations)`

Checks if there are any critical or serious accessibility violations.

**Parameters:**
- `violations: AccessibilityViolation[]` - Array of violations

**Returns:** `boolean` - True if critical or serious violations exist

**Example:**
```typescript
const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
if (criticalViolations) {
  console.log('Critical issues found!');
}
```

### `formatViolations(violations)`

Formats accessibility violations into a readable string for test reports.

**Parameters:**
- `violations: AccessibilityViolation[]` - Array of violations

**Returns:** `string` - Formatted violations with details

**Example:**
```typescript
const formatted = AccessibilityUtilities.formatViolations(results.violations);
console.log(formatted);
// Output:
// 1. color-contrast (serious)
//    Description: Elements must have sufficient color contrast
//    Help: Ensure text has sufficient contrast
//    Help URL: https://...
//    Affected elements (2):
//     Target: #submit-button
//     HTML: <button id="submit-button">Submit</button>
```

### `filterViolationsByImpact(violations, impacts)`

Filters violations by impact level.

**Parameters:**
- `violations: AccessibilityViolation[]` - Array of violations
- `impacts: string[]` - Impact levels to filter by: `'critical'`, `'serious'`, `'moderate'`, `'minor'`

**Returns:** `AccessibilityViolation[]` - Filtered violations

**Example:**
```typescript
// Get only critical violations
const critical = AccessibilityUtilities.filterViolationsByImpact(results.violations, ['critical']);

// Get critical and serious violations
const highPriority = AccessibilityUtilities.filterViolationsByImpact(results.violations, ['critical', 'serious']);
```

## Common Test Patterns

### Testing Multiple Pages in a Journey

```typescript
test('Full user journey should maintain accessibility standards', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();

  // Check home page
  let results = await AccessibilityUtilities.analyzeAccessibility(page);
  expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 
    'Home page should be accessible').toBe(false);

  // Navigate and check next page
  const nextPage = await homePage.clickStartNow();
  results = await AccessibilityUtilities.analyzeAccessibility(page);
  expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 
    'Next page should be accessible').toBe(false);
});
```

### Testing Error States

```typescript
test('Validation error panel should be accessible', async ({ page }) => {
  const contactPage = new ContactDetailsPage(page);
  await contactPage.navigate();

  // Trigger validation errors
  await contactPage.clickContinue();
  
  // Analyze accessibility with error panel displayed
  const results = await AccessibilityUtilities.analyzeAccessibility(page);
  
  const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
  expect(criticalViolations, 
    `Error panel has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`
  ).toBe(false);
});
```

### Testing Specific WCAG Tags

```typescript
test('Page should meet WCAG 2.1 AA color contrast standards', async ({ page }) => {
  await page.goto('/');

  const results = await AccessibilityUtilities.analyzeAccessibility(page, {
    includeTags: ['wcag143'] // WCAG 1.4.3 Contrast (Minimum)
  });

  expect(results.violationCount, 
    `Color contrast violations found:\n${AccessibilityUtilities.formatViolations(results.violations)}`
  ).toBe(0);
});
```

## Running Accessibility Tests

```bash
# Run all accessibility tests
npx playwright test --project=accessibility

# Run specific accessibility test
npx playwright test --grep "should be accessible"

# Run with tag
npx playwright test --grep @accessibility
```

## Best Practices

1. **Test at key points** - Check accessibility after navigation, interactions, and state changes
2. **Include error states** - Verify error messages and validation are accessible
3. **Test dynamic content** - Check modals, tooltips, and dynamically loaded content
4. **Use descriptive assertions** - Include formatted violations in error messages for easy debugging
5. **Focus on critical issues** - Use `hasCriticalViolations()` to fail on serious problems
6. **Complement with manual testing** - Automated tests don't catch everything (see WCAG coverage in AccessibilityUtilities.ts)


