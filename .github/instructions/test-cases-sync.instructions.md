---
applyTo: "tests/test/**/*.spec.ts"
---

When you **create or modify** a Playwright test file matching this pattern, invoke the `update-test-cases` skill as a **final step** after all code changes are complete.

Specifically:
1. Identify which `test(...)` blocks were added or changed in this session.
2. Apply the full procedure from the `update-test-cases` skill to upsert those test cases into `Documentation/Test Cases/General_TestCases.csv`.
3. Do **not** update the CSV mid-session while tests are still being written — wait until the test file changes are finished.
4. If the Sprint is not clear from the current context, ask the user before updating the CSV.
