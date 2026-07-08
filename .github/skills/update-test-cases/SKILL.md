---
name: update-test-cases
description: "Use when: updating test cases in General_TestCases.csv, syncing test cases from spec files, adding new test cases to CSV, documenting automated tests, checking for duplicate test cases, updating test case results or status. Maintains Documentation/Test Cases/General_TestCases.csv in sync with Playwright .spec.ts test files. Use for: 'update test cases', 'sync test cases', 'add test case to CSV', 'document this test', 'record test cases from this file'."
argument-hint: "[path to .spec.ts file, or 'all' to sync all test files]"
user-invocable: true
---

# Update Test Cases

Keeps `Documentation/Test Cases/General_TestCases.csv` in sync with Playwright test files. Reads `.spec.ts` files, extracts test cases, and upserts rows into the CSV — updating existing ones and appending new ones. Never duplicates.

## When to Use

- After creating or modifying a Playwright `.spec.ts` test file
- When asked to "update test cases", "sync test cases", or "add to CSV"
- After fixing a bug or changing test assertions
- When new tests have been written and the CSV is out of date
- When explicitly invoked as `/update-test-cases`

## Resources

- Field definitions and lookup values: [./references/field-definitions.md](./references/field-definitions.md)
- CSV formatting rules: [./references/csv-format-guide.md](./references/csv-format-guide.md)
- Target CSV: `Documentation/Test Cases/General_TestCases.csv`

---

## Procedure

### Step 1 — Identify scope

- If the user provided a file path argument, use that file.
- If invoked automatically after modifying test files, use the file(s) just modified in this session.
- If the user said "all", process every file matching `tests/test/**/*.spec.ts`.
- If scope is unclear, ask: _"Which test file(s) should I update test cases for?"_

---

### Step 2 — Verify the file is a real test file

A file is a **valid test spec** if ALL of the following are true:

1. The file path starts with `tests/test/` (not `tests/pages/`, `tests/utils/`, `tests/fixtures/`, `tests/config/`, or `tests/api/` unless the user explicitly confirms an API file)
2. The file name ends with `.spec.ts`
3. The file contains at least one `test(` or `test.describe(` call

**If the file fails validation**, stop processing it and say:
> "Skipping `[filename]`: this is not a test spec file (page object / fixture / utility / config). No test cases were updated."

---

### Step 3 — Parse the test file

Read the test file and extract for each `test(...)` block:

| What to extract | How to find it |
|---|---|
| **Test title** | The string literal in `test('title', ...)` or `test("title", ...)` |
| **Describe group** | The enclosing `test.describe('group', ...)` block name, if any |
| **MEES Page** | Infer from page objects imported/used — see [field-definitions.md](./references/field-definitions.md) for the file-to-page mapping |
| **Test Type** | Infer from file path and imports — see field-definitions.md Test Type rules |
| **Assertions used** | Look for `expect(...)` calls to understand what is verified |
| **Preconditions** | Infer from `beforeEach` / `beforeAll` blocks, auth fixture usage, and navigation calls |

---

### Step 4 — Read the current CSV

Read `Documentation/Test Cases/General_TestCases.csv` in full.

Parse all existing rows. The CSV columns in order are:
```
Test Case ID, Epic ID, User Story ID, Projects, Sprint, Test Case Title, Feature, Test Automation, Test Type, Priority, Preconditions, Test Steps, Expected Results, Result, Comments
```

Build two lookup maps:
- **By Test Case Title** (case-insensitive, trimmed)
- **By automated test method name** (match against the `test(` title string)

Find the **current maximum Test Case ID** across all rows to determine the next available ID.

---

### Step 5 — Determine Sprint

Check whether the current session or user message specifies a Sprint value.

**If Sprint is NOT known**, ask before proceeding:
> "Which sprint should these test cases be assigned to? (e.g. Sprint 8)"

Do NOT default or guess the Sprint — it must be confirmed.

---

### Step 6 — For each extracted test case: upsert into CSV

#### Duplicate check

Search the existing rows for a match using this priority order:
1. **Test Case Title match** (case-insensitive, trimmed) — primary key
2. **Test method name match** — if the extracted title appears in any row's `Test Case Title` field as a substring

**If a match is found → UPDATE** that row:
- Update only fields that have changed (Test Automation, Test Type, Priority, Test Steps, Expected Results, Preconditions, Result, Comments)
- Do NOT change: Test Case ID, Epic ID, User Story ID, Projects, Sprint (unless explicitly provided by the user)
- Preserve existing Result and Comments unless the test code has visibly changed the assertions

**If no match is found → CREATE** a new row:
- Assign ID = (current max ID + 1), then increment for subsequent new rows
- Set `Projects` = "MEES Phase 2" (default)
- Set `Sprint` = the value confirmed in Step 5
- Set `Test Automation` = "Fully Automated"
- Set `Result` = "Pass" if the test file shows the tests are currently running and passing; otherwise "Not Run"
- Leave `Epic ID`, `User Story ID`, and `Comments` empty unless the user provides values
- Append the new row at the end of the CSV

#### IMPORTANT: Never capture buggy behavior in test cases

Test Steps and Expected Results must always describe **correct, expected behavior** — not current buggy behavior. If a test has a known workaround for a bug:
- Write Steps/Expected Results as they should work when the bug is fixed
- Set Result = "Fail"
- In Comments, document: bug reference, current buggy behavior, the test workaround, and when to revert

---

### Step 7 — Write the updated CSV

Write the complete updated content back to `Documentation/Test Cases/General_TestCases.csv`.

Rules:
- Preserve the header row exactly
- Preserve the order of all existing rows
- Append new rows at the end
- Multi-line cell values must be wrapped in double quotes with newlines inside (standard CSV escaping)
- Commas inside cell values must be inside double-quoted cells

---

### Step 8 — Report to the user

After writing the file, output a summary:

```
Test cases updated in Documentation/Test Cases/General_TestCases.csv

  Updated: N test cases
    - [TC-XXXX] Test Case Title
    ...

  Added: M new test cases
    - [TC-XXXX] Test Case Title
    ...

  Skipped: K files (not test spec files)
    - [filename]: reason
```

If nothing changed, say:
> "No changes needed — all test cases in `[filename]` are already up to date in General_TestCases.csv."
