# Accessibility Testing Guide

This guide explains how to write automated accessibility tests using the `AccessibilityUtilities` class.

## Overview

The framework uses **axe-core** integrated with Playwright to automatically detect accessibility violations against WCAG 2.2 AA standards.

## WCAG 2.2 AA Coverage

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
| 2.4.11 | Focus Not Obscured (Minimum) **[NEW 2.2]** | Axe may detect overlapping elements; manual verification of focus visibility required |
| 2.5.8 | Target Size (Minimum) **[NEW 2.2]** | Axe cannot measure target sizes; requires manual measurement or scripted validation |

### 👀 Manual Only

| **SC** | **Description** |
|--------|-----------------|
| 1.2.x | Time-based Media (captions, audio descriptions) |
| 1.3.4 | Orientation (support portrait/landscape) |
| 1.3.5 | Identify Input Purpose |
| 2.2.x | Timing Adjustable |
| 2.4.1 | Bypass Blocks (skip links, landmarks) |
| 2.5.x | Pointer Gestures |
| 2.5.7 | Dragging Movements **[NEW 2.2]** |
| 3.2.x | Predictable (on focus/input behavior consistency) |
| 3.2.6 | Consistent Help **[NEW 2.2]** |
| 3.3.4 | Error Prevention (Legal, Financial, Data) |
| 3.3.7 | Redundant Entry **[NEW 2.2]** |
| 3.3.8 | Accessible Authentication (Minimum) **[NEW 2.2]** |
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

## Configuration

### Centralized Config File

Accessibility test configuration is managed in `tests/config/accessibility.config.json`:

```json
{
  "includeTags": ["wcag22aa"],
  "excludeTags": [],
  "disableRules": []
}
```

**Available Tags:**
- `wcag2a`, `wcag2aa` - WCAG 2.0 Level A/AA
- `wcag21a`, `wcag21aa` - WCAG 2.1 Level A/AA
- `wcag22a`, `wcag22aa` - WCAG 2.2 Level A/AA
- `best-practice` - Best practice rules beyond WCAG


## Available Methods

### `analyzeAccessibility(page)`

Analyzes the current page for accessibility violations using axe-core. Configuration is loaded from `tests/config/accessibility.config.json`.

**Parameters:**
- `page: Page` - The Playwright page object

**Returns:** `Promise<AccessibilityResult>`
- `violations: AccessibilityViolation[]` - Array of violations found
- `passes: number` - Number of passed checks
- `incomplete: number` - Number of incomplete checks
- `violationCount: number` - Total violations

**Example:**
```typescript
const results = await AccessibilityUtilities.analyzeAccessibility(page);
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

## Running Accessibility Tests

```bash
# Run all accessibility tests
npx playwright test --project=accessibility

# Run specific accessibility test in debug mode
npx playwright test --project=accessibility -g "Validation error panel" --debug
```