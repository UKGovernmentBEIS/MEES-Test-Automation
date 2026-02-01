# Accessibility Testing Guide

**Purpose**: Automated WCAG 2.2 AA compliance testing using axe-core integrated with Playwright.

**What it includes**:
- Automated accessibility violation detection
- WCAG 2.2 AA standard compliance checking
- Integration with context verification for comprehensive page validation
- Coverage reporting for accessibility testing status

## Quick Start

```typescript
import { test, expect } from '../../fixtures/authFixtures';
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

test('Page accessibility test', async ({ page }) => {
  await page.goto('/your-page');
  
  // Run accessibility analysis
  const results = await AccessibilityUtilities.analyzeAccessibility(page);
  const hasCritical = AccessibilityUtilities.hasCriticalViolations(results.violations);
  
  expect(hasCritical, 
    `Critical accessibility violations found:\n${AccessibilityUtilities.formatViolations(results.violations)}`
  ).toBe(false);
});
```

```bash
# Run accessibility tests
npx playwright test --project=non-functional
```

## WCAG 2.2 AA Coverage

**✅ Fully Automated** (detected by axe-core):
- Alt text for images
- Color contrast ratios
- Semantic HTML structure
- ARIA roles and properties
- Form labels and error identification
- Heading hierarchy
- Language declarations
- Keyboard navigation issues

**⚠️ Partially Automated** (requires additional validation):
- Keyboard operability (basic detection only)
- Focus management and visibility
- Target size for touch interfaces
- Content appearing on hover/focus

**👀 Manual Testing Required**:
- Screen reader compatibility
- Timing and animations
- Complex user interactions
- Context-specific content requirements

## Configuration

Accessibility testing configured in `tests/config/accessibility.config.json`:

```json
{
  "includeTags": ["wcag22aa"],
  "excludeTags": [],
  "disableRules": []
}
```