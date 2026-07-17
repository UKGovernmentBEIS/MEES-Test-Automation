# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Playwright + TypeScript test automation for the MEES (Minimum Energy Efficiency Standards) compliance web application. Covers functional (E2E), non-functional (accessibility + DOM/context regression), and API tests (both the app's own Page API and the backend DMS API), running against GOV.UK One Login authenticated sessions.

## Commands

```bash
# Install
npm install
npx playwright install

# Authenticate test accounts (creates playwright/auth-states/user-N.json + worker-email-map.json)
# Required before functional/non-functional runs unless RUN_SETUP_AUTOMATICALLY=1
npx playwright test --project=setup

# Run by project
npx playwright test --project=functional
npx playwright test --project=non-functional
npx playwright test --project=api
npx playwright test                              # everything

# Single test / debugging
npx playwright test -g "test name"
npx playwright test path/to/file.spec.ts
npx playwright test --ui
npx playwright test --headed
npx playwright test --trace on

# Reports
npx playwright show-report
# non-functional coverage summary: test-results/non-functional-test-coverage.md (+ .html)
```

There is no build/lint/typecheck npm script defined (`package.json` has no `scripts`); TypeScript is executed directly by Playwright's built-in transform. `tsconfig.json` only covers `tests/**/*` and `playwright.config.ts`.

## Authentication architecture

Session state is stored once and reused, rather than logging in per test:

1. `tests/test/setup/auth.setup.ts` runs one `setup` test per account in `tests/config/test-accounts.json`, logging in via `AuthUtils.performLogin` and writing `playwright/auth-states/user-{workerIndex}.json` plus a shared `worker-email-map.json` (worker index → email).
2. `tests/fixtures/authFixtures.ts` provides a custom `test`/`page` fixture (used instead of `@playwright/test`'s in functional/non-functional specs) that creates **one browser context per worker**, loaded with that worker's storage state, and stashes `_workerIndex`/`_authenticatedUserEmail` on the context. Each test gets a fresh `page` from the shared worker context — this is why `workers: 2` in `playwright.config.ts` must match the number of accounts configured.
3. Recovery is lazy, not preemptive: `LandingPage.clickSignIn_AuthenticatedUser()` detects a redirect back to GOV.UK/login and calls `AuthUtils.reAuthenticate()`, which looks up the worker's credentials via the stored `_workerIndex`, re-runs the login flow, and overwrites that worker's auth state file. No test should need to handle re-auth manually.
4. Credentials are never stored directly — `test-accounts.json` holds env-var *names*, and `AuthUtils.resolveCredentials()` reads the actual values from `process.env` at runtime.

Two account shapes matter beyond the standard parallel `accounts[]` list:
- `noAccessAccount` — a valid One Login account with no MEES access, for access-denied tests.
- `dualAccessAccount` — an account with access to both MEES and PRSE (a separate app served from the same host at `/PRSELocalAuthority` instead of `/compliance/`); see `HomePageTests.spec.ts`'s "Dual Access User" describe blocks for how `PRSE_BASE_URL`/`BASE_URL` is derived.

Standard `@playwright/test`'s `test` (imported as `baseTest`) is used instead of the custom auth fixture for tests that don't want a pre-authenticated shared context (e.g. the dual-access flows, which perform their own explicit login).

## Page Object Model

- `tests/pages/BasePage.ts` is the abstract root: every page class implements `isDisplayed()`, `getPageContextLocator()`, `waitForPageToLoad()`, and gets a shared, once-per-page-instance global console-error listener (`getAllConsoleErrors()`), used by functional tests to assert on known console error counts.
- Pages are organized by app area: `tests/pages/Login/*` (One Login flows), `tests/pages/Compliance/*` (the MEES app, with subfolders `Guidance/`, `Support/`, `ProfileSettings/`, `Cookies/`), plus `LandingPage.ts` and `PRSELandingPage.ts` at the top level.
- Navigation methods return the next page object (e.g. `LandingPage.clickSignIn_NotAuthenticatedUser()` → `SignInOrCreatePage`), so tests read as a chained flow through the page graph rather than juggling locators directly.
- Most pages expose a `*InNewTab()` variant of their navigation methods (via `BasePage`-adjacent `openLinkInNewTab`) because many links in the app intentionally open new tabs — both variants are typically tested.
- `tests/utils/ElementUtilities.ts` centralizes low-level interactions (`clickElement`, `fillText`, `checkElement`, `waitForPageToLoad`) and fails loudly with descriptive errors rather than silently timing out — page objects should route through it instead of calling Playwright locator methods directly for these actions.

## Non-functional tests

`tests/test/non-functional/*.spec.ts` are numbered by page-flow order (01-HomePage, 02-FilterProperties, … 8x for Login/edge pages) and each pairs two concerns via `BaseNonFunctionalTest` (`tests/utils/BaseNonFunctionalTest.ts`):
- **Accessibility**: `verifyAccessibility()` runs axe-core (`tests/utils/AccessibilityUtilities.ts`, configured by `tests/config/accessibility.config.json`) and fails only on `critical`/`serious` impact violations.
- **Context verification**: `verifyContextWithLocators()` asserts `toMatchAriaSnapshot()` against committed `*.spec.ts-snapshots/*.aria.yml` files — these are DOM-structure/content regression snapshots, not visual screenshots. Update them via Playwright's normal `--update-snapshots` flow when a page's structure intentionally changes.
- Every test calls `baseTest.addTestAnnotations(PageName.X, [...])` (see `tests/utils/TestTypes.ts` for the `PageName`/`TestType` enums) — these annotations drive the custom `tests/utils/NonFunctionalTestReporter.ts` reporter and the generated `test-results/non-functional-test-coverage.md` summary. New pages/test types should be added to the enums rather than passed as raw strings where possible.

## API tests

`tests/test/api/*.spec.ts` cover two distinct boundaries — check which one a test is exercising before editing it:
- **Page API** — the MEES app's own backend, exercised as the authenticated user would (`PropertiesTests`, `PropertyTests`, `LocalAuthoritiesTests`).
- **DMS API** — a separate service-level export API, accessed via `tests/api/DMSExportApiClient.ts` using an `x-functions-key` header (`EXPORT_KEY`/`DMS_BASE_URL` env vars), used by `ExportTests.spec.ts` and by functional/non-functional tests that need to fetch real backing data (e.g. a property with multiple landlords, or one with EPC certificates) to drive test scenarios rather than hardcoding fixture data.

The `api` project has no auth dependency and runs `fullyParallel`.

## Environment configuration

Multiple `.env*` files exist for different targets (`.env`, `.env.dev`, `.env.qa`, `.env.uat`, etc.) — `playwright.config.ts` loads `.env` via `dotenv` at startup, so switching environments means swapping/pointing to the right file, not passing `--env`. Key variables: `BASE_URL`, `TEST_ACCOUNT_N_{EMAIL,PASSWORD,NAME}`, `TEST_NO_ACCESS_*`, `TEST_DUAL_ACCESS_*`, `DMS_BASE_URL`, `EXPORT_KEY`/`PROPERTIES_KEY`/`PROPERTY_KEY`/`LOCAL_AUTHORITIES_KEY`.

Test data (property IDs, addresses, expected values, etc.) is hardcoded in several spec files and must be re-verified when pointing at a new environment — see `Documentation/TestDataSetup.md` for the full list of what to check.

## CI/CD

Two GitHub Actions workflows in `.github/workflows/`:
- `playwright-latest.yml` — push to `main`/`master`, nightly, or manual dispatch against `new qa` (default) or `new uat`.
- `playwright-release.yml` — nightly/manual against `new uat` only, checking out the latest git tag so tests match the deployed release.
Shared job logic lives in `.github/workflows/templates/`. Each environment runs functional/non-functional/API jobs with their own setup + recovery steps. See `Documentation/CI-CD.md` for secrets and full pipeline details.

## Test case CSV sync (Copilot skill, applies here too)

`Documentation/Test Cases/General_TestCases.csv` is the git-tracked test case register and must stay in sync with the spec files. Per `.github/instructions/test-cases-sync.instructions.md`, whenever you create or modify a file matching `tests/test/**/*.spec.ts`, run the `update-test-cases` procedure (`.github/skills/update-test-cases/SKILL.md`) as a final step once the test code changes are finished — not mid-session. It upserts by test title (never duplicates), and requires a confirmed Sprint value before writing new rows; ask the user if it isn't clear from context. Field lookup rules live in `.github/skills/update-test-cases/references/field-definitions.md` and CSV formatting rules in `.github/skills/update-test-cases/references/csv-format-guide.md`.

## Other documentation

- `Documentation/Authentication.md` — auth setup/troubleshooting detail beyond the summary above.
- `Documentation/Accessibility.md` — WCAG 2.2 AA testing approach.
- `Documentation/ContextVerification.md` — DOM/aria snapshot verification approach.
- `Documentation/TestDataSetup.md` — hardcoded test data to check per environment.
- `Documentation/CI-CD.md` — pipeline/secrets configuration.
