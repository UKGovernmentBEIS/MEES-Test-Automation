# CSV Format Guide

Formatting rules, escaping, and Playwright extraction patterns for `General_TestCases.csv`.

---

## CSV Structure Rules

### One Row Per Test Case
Each test case occupies **exactly one CSV row**, regardless of how many steps it has.

### Multi-line Cell Values
When a cell contains newlines (Test Steps, Expected Results, Preconditions, Comments), the entire cell value must be wrapped in double quotes and newlines are literal inside the quotes.

**Example — correct CSV encoding:**
```
2000,E839,791,MEES Phase 2,Sprint 2,My Test Title,Home Page,Fully Automated,Functional,High,"1. User is logged in
2. User is on the Home Page","1. Navigate to Home Page
2. Click the button","1. Home Page loads
2. Button is clicked",Pass,
```

### Commas Inside Cell Values
Any cell value containing a comma must be double-quoted:
```
"LONDON BOROUGH OF BEXLEY, DA1 4AL"
```

### Empty Fields
Empty fields are represented as consecutive commas with nothing between them:
```
2048,E839,791,MEES Phase 2,Sprint 2,My Test,,Fully Automated,...
```

### Quotes Inside Quoted Cells
Escape a literal double-quote inside a quoted cell by doubling it:
```
"He said ""hello"" to the user"
```

---

## Extraction from Playwright Test Files

### Finding Test Cases

```typescript
// Single test — extract title from string literal
test('should display welcome message on home page', async ({ page }) => { ... });

// Named group — include describe name for context
test.describe('Home Page Navigation', () => {
  test('should open Filter page in new tab', async ({ page }) => { ... });
});
```

When a `test.describe` group exists, the **Test Case Title** should reflect both the group and test name if the individual test title alone is not self-descriptive.

### Inferring Preconditions

| Code Pattern | Precondition |
|---|---|
| `authenticatedPage` fixture or `storageState` in fixture | "User is logged in and authenticated" |
| `beforeEach` navigates to a specific page | "User is on the [page name] page" |
| `beforeAll` sets up API data or test state | Describe the setup state |
| `test.use({ storageState: ... })` | "User is logged in and authenticated" |

### Inferring Test Steps and Expected Results

Translate code actions into plain-English steps:

| Code | Step | Expected Result |
|---|---|---|
| `await page.goto('/filter')` | Navigate to the Filter Properties page | Filter Properties page is displayed |
| `await filterPage.setEnergyRatingFilter('A')` | Set Energy Rating filter to 'A' | Energy Rating filter is set to 'A' |
| `await expect(locator).toBeVisible()` | Inspect whether [element] is visible | [Element] is visible on the page |
| `await expect(locator).toHaveText('value')` | Verify [element] text | [Element] displays 'value' |
| `await expect(locator).not.toBeVisible()` | Inspect whether [element] is absent | [Element] is not visible on the page |
| `await page.waitForURL(...)` | Wait for navigation to complete | Page navigates to [URL/route] |
| `await accessibilityUtilities.runScan()` | Run the accessibility scanner | No critical accessibility violations are found |
| `await page.context().newPage()` or middle-click | Open in new tab | A new browser tab is opened |

### Inferring Test Type from Imports

```typescript
// Accessibility test
import { AccessibilityUtilities } from '../../utils/AccessibilityUtilities';

// Integration / API test  
import { DMSExportApiClient } from '../../api/DMSExportApiClient';
// or any direct fetch() / request() calls to API endpoints

// Functional test — everything else in tests/test/functional/
```

---

## Duplicate Detection Logic

When checking if a test case already exists in the CSV:

1. **Primary match**: Normalize both the extracted test title and every CSV `Test Case Title` value by:
   - Trimming whitespace
   - Converting to lowercase
   - Comparing exact match

2. **Secondary match**: Check if the extracted test title appears as a **substring** of any CSV `Test Case Title` (after normalization), or vice versa.

3. **If ambiguous** (multiple partial matches), prefer the row whose title is the closest match by character similarity, and confirm with the user if still uncertain.

**Never create a new row if a match is found.**

---

## Basic Workflow Summary

1. **Identify scope** — which `.spec.ts` file(s) to process
2. **Validate** — confirm each file is a real test spec (not a page object, fixture, or utility)
3. **Parse** — extract test titles, groups, page objects, assertion patterns, file path
4. **Read CSV** — load all existing rows and build duplicate-detection lookup maps
5. **Confirm Sprint** — ask user if Sprint is not known
6. **Upsert** — update matched rows; append new rows for unmatched tests
7. **Write CSV** — preserve header and existing row order; append new rows at end
8. **Report** — tell the user what was updated, added, and skipped

---

## ID Assignment

```
Next ID = MAX(all existing Test Case IDs) + 1
```

- IDs are integers only (no letters, no dashes)
- When adding multiple new rows in one pass, increment sequentially: max+1, max+2, max+3 …
- Do not reuse IDs from deleted rows

---

## Example: Full Extraction

**Source file:** `tests/test/functional/HomePageTests.spec.ts`

```typescript
test.describe('Home Page Navigation', () => {
  test('should open Filter Properties page in a new tab when middle-clicking View property records link', async ({ authenticatedPage }) => {
    await homePage.middleClickViewPropertyRecordsLink();
    const newTab = await context.waitForEvent('page');
    await expect(newTab).toHaveURL(/filter/);
  });
});
```

**Extracted CSV row:**
```
Test Case ID: (next available ID)
Epic ID: (empty — ask user or leave blank)
User Story ID: (empty)
Projects: MEES Phase 2
Sprint: (ask user)
Test Case Title: Home Page Navigation: should open Filter Properties page in a new tab when middle-clicking View property records link
Feature: Home Page
Test Automation: Fully Automated
Test Type: Functional
Priority: High
Preconditions: 1. User is logged in and authenticated
               2. User is on the Home page
Test Steps: 1. Middle-click the 'View property records' link on the Home page
            2. Switch to the newly opened browser tab
            3. Verify the Filter Properties page is displayed
Expected Results: 1. A new browser tab is opened
                  2. The new tab becomes active
                  3. Filter Properties page is displayed in the new tab
Result: Pass
Comments: (empty)
```
