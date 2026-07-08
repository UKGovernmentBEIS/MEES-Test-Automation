# Field Definitions and Lookup Values

All field definitions, lookup values, and mapping rules for `General_TestCases.csv`.

---

## CSV Column Order

The header row must appear **exactly** in this order:

```
Test Case ID, Epic ID, User Story ID, Projects, Sprint, Test Case Title, Feature, Test Automation, Test Type, Priority, Preconditions, Test Steps, Expected Results, Result, Comments
```

---

## Field Reference

### Test Case ID
- Unique numeric identifier
- IDs start from **2000** and increment sequentially (2000, 2001, 2002 …)
- Never reuse an ID from a deleted row
- To assign a new ID: read all existing IDs, take the maximum, add 1

---

### Projects
- **MEES Phase 1** — First phase of the MEES Compliance Hub project
- **MEES Phase 2** *(default)* — Second phase of the MEES Compliance Hub project

---

### Epic ID
Identifier linking the test case to an epic (e.g. E839, E852). Leave empty if not provided by the user.

---

### User Story ID
Identifier linking the test case to a user story (e.g. 791, 867). Leave empty if not provided by the user.

---

### Sprint
The sprint when the test case should be executed (e.g. Sprint 2, Sprint 8).

**REQUIRED — always confirm with the user if not provided. Never guess or default.**

---

### Test Case Title
Descriptive name that clearly indicates what is being tested. Match the `test(...)` description from the spec file where possible.

---

### Feature (MEES Page)
The page or section of the application being tested:

| Value | When to Use |
|---|---|
| **Landing Page** | The initial landing/welcome page |
| **Authentication pages** | Login, registration, password reset pages |
| **Home Page** | Main dashboard after login |
| **Filter Page** | Property filtering interface (`FilterPropertiesPage`) |
| **View Properties Page** | Property listing/search results page (`ViewPropertiesPage`) |
| **Property Details** | Individual property information page (`PropertyDetailsPage`) |
| **Penalty Calculator** | Penalty calculator page (`PenaltyCalculatorPage`) |
| **Templates** | Templates download page (`TemplatesPage`) |
| **Guidance** | Guidance pages |
| **Support pages** | Support journey pages |
| **Cookies Banner** | Cookie consent banner |
| **Cookies Settings Page** | Cookie settings page |

#### File-to-Feature Mapping

| Test File Path | Feature Value |
|---|---|
| `tests/test/functional/HomePageTests.spec.ts` | Home Page |
| `tests/test/functional/FilterPropertiesPageTest.spec.ts` | Filter Page |
| `tests/test/functional/ViewPropertiesPageTests.spec.ts` | View Properties Page |
| `tests/test/functional/PropertyDetailsPageTest.spec.ts` | Property Details |
| `tests/test/functional/PenaltyCalculatorPageTests.spec.ts` | Penalty Calculator |
| `tests/test/functional/TemplatesPageTest.spec.ts` | Templates |
| `tests/test/functional/GuidancePageTests.spec.ts` | Guidance |
| `tests/test/functional/LandingPageTests.spec.ts` | Landing Page |
| `tests/test/functional/ProfileSettingsTests.spec.ts` | Profile settings |
| `tests/test/non-functional/*LandingPageTests.spec.ts` | Landing Page |
| `tests/test/non-functional/*LoginPagesTests.spec.ts` | Authentication pages |
| `tests/test/non-functional/*RegistrationPageTests.spec.ts` | Authentication pages |
| `tests/test/api/*.spec.ts` | Determine from API endpoint purpose |

---

### Test Automation

| Value | When to Use |
|---|---|
| **Fully Automated** | Test is completely automated via Playwright |
| **Not Automated** | Test is manual only |
| **Not Automatable** | Test cannot be automated (e.g. requires physical verification) |
| **Partial Automated** | Test is not fully automatable |

Default for tests extracted from `.spec.ts` files: **Fully Automated**

---

### Test Type

| Value | When to Use |
|---|---|
| **Functional** | Tests business logic and user workflows |
| **Accessibility** | Tests compliance with WCAG accessibility standards |
| **Integration** | Tests API endpoints and system integration |
| **Security** | Tests authentication, authorization, and security features |
| **Performance** | Tests application performance under specific load conditions |

#### Test Type Automatic Assignment Rules

| Condition | Assign |
|---|---|
| File is in `tests/test/functional/` | **Functional** |
| File is in `tests/test/non-functional/` AND imports/uses `AccessibilityUtilities` | **Accessibility** |
| File is in `tests/test/non-functional/` AND does NOT use `AccessibilityUtilities` | **Functional** |
| File is in `tests/test/api/` | **Integration** |
| Test imports or calls `AccessibilityUtilities` in any location | **Accessibility** |

---

### Priority

| Value | When to Use |
|---|---|
| **High** | Critical functionality, must be tested |
| **Medium** | Important functionality, should be tested |
| **Low** | Nice-to-have functionality, optional testing |

#### Priority Guidelines

| Scenario | Priority |
|---|---|
| Core navigation and login tests | High |
| Main business functionality tests | High or Medium |
| Edge cases and error handling | Medium or Low |
| UI validation tests | Medium |
| Performance tests | Medium |
| Accessibility tests | Medium |

---

### Preconditions
The state or conditions that must be met before executing the test steps.

- Number each precondition on its own line: `1. Condition one\n2. Condition two`
- Infer from `beforeEach` / `beforeAll` blocks, auth fixture usage, and navigation calls in the test file
- Common preconditions: "User is logged in and authenticated", "User is on the [Page name] page"

---

### Test Steps
Specific actions performed during the test. Each step on its own numbered line within a single CSV cell.

```
1. Navigate to the page
2. Click the button
3. Verify the result
```

**One row per test case** — regardless of how many steps. Multi-line values go inside a double-quoted CSV cell.

---

### Expected Results
What should happen when each test step is executed correctly. Numbered to match Test Steps exactly.

```
1. Page is displayed
2. Button is clicked and action triggers
3. Expected state is shown
```

**The count of Expected Results must equal the count of Test Steps.**

---

### Result

| Value | When to Use |
|---|---|
| **Pass** | Test executed successfully and met expectations |
| **Fail** | Test failed or did not meet expectations |
| **Not Run** | Test has not been executed yet |

**Rules:**
- `Not Run` is **only applicable** to non-automated tests (Not Automated, Not Automatable, Partial Automated)
- `Fully Automated` tests must have **Pass** or **Fail** — never `Not Run`
- If the automated test exists but hasn't been run in this session, use `Not Run` as a conservative default and note it

---

### Comments
**Only populated when Result = Fail.**

Record all of the following:
1. Bug/defect reference (e.g. "Bug 1062")
2. Description of the current buggy behavior
3. The workaround applied in the automated test assertion
4. Instructions for when to revert the workaround

Leave empty for Pass and Not Run results.

---

## Handling Bugs in Test Cases

> **CRITICAL: NEVER create test cases that validate buggy behavior.**

Test cases must always capture **the expected correct behavior**, not current broken behavior.

When a bug causes different behavior:
1. Write Test Steps and Expected Results that reflect **what SHOULD happen** (correct behavior)
2. Set Result to **Fail**
3. In Comments, document:
   - Bug reference number
   - Current buggy behavior (what actually happens now)
   - Any workaround in the test assertion
   - When to revert the workaround

This ensures test cases serve as specifications for correct behavior, not documentation of bugs.

### Example

**Scenario:** Bug 1031 causes a field to show "Not found" instead of the correct value.

| Field | Value |
|---|---|
| Test Steps | `1. Inspect the 'Possible rental evidence from EPC register' field` |
| Expected Results | `1. 'Possible rental evidence from EPC register' displays 'Mandatory issue (Property to let) EPC transaction type'` |
| Result | Fail |
| Comments | `Bug 1031 - Field incorrectly displays 'Not found'. Automation workaround asserts 'Not found'. Revert to assert correct value when Bug 1031 is resolved.` |
