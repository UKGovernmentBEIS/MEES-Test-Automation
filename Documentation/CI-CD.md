# CI/CD Configuration

## Overview

GitHub Actions pipeline for automated test execution with **three-job architecture per environment**, using reusable workflow templates:

1. **Functional Tests** — runs setup and functional tests with real-time authentication recovery
2. **Non-Functional Tests** — runs setup and accessibility/validation tests with real-time authentication recovery
3. **API Tests** — runs API boundary tests (no browser container needed)

**Two workflows**:
- **`playwright-latest.yml`** — runs the latest code; triggers on push to `main`/`master`, nightly schedule (9:55 PM UTC), and manual dispatch with an optional `environment` input (`new qa` by default, or `new uat`)
- **`playwright-release.yml`** — runs tagged releases on `new uat` only; triggers on nightly schedule (11:55 PM UTC) and manual dispatch with an optional `tag` input

**Shared templates**: Job definitions in `.github/workflows/` (`template-functional-tests.yml`, `template-non-functional-tests.yml`, `template-api-tests.yml`) are called by both workflows via `uses:` to avoid duplication.

**Benefits**: Each test project gets fresh authentication state, LandingPage-based recovery prevents all conflicts, streamlined architecture with shared utilities.

## GitHub Actions Setup

### Configure Repository Secrets

**Path**: Repository Settings → Secrets and variables → Actions

**Required secrets**:
```
# Standard test accounts (used by functional and non-functional tests)
TEST_ACCOUNT_1_NAME = Test User 1
TEST_ACCOUNT_1_EMAIL = user1@example.com
TEST_ACCOUNT_1_PASSWORD = Password123!
TEST_ACCOUNT_2_NAME = Test User 2
TEST_ACCOUNT_2_EMAIL = user2@example.com
TEST_ACCOUNT_2_PASSWORD = Password456!
TEST_ACCOUNT_3_NAME = Test User 3
TEST_ACCOUNT_3_EMAIL = user3@example.com
TEST_ACCOUNT_3_PASSWORD = Password789!

# Special-role accounts
TEST_NO_ACCESS_EMAIL = noaccess@example.com
TEST_NO_ACCESS_PASSWORD = NoAccessPassword!
TEST_DUAL_ACCESS_EMAIL = dualaccess@example.com
TEST_DUAL_ACCESS_PASSWORD = DualAccessPassword!

# Application URL
BASE_URL = https://your-app-url.com

# API keys (used by DMS-API tests)
PROPERTIES_KEY = your-properties-api-key-here
PROPERTY_KEY = your-property-api-key-here
LOCAL_AUTHORITIES_KEY = your-la-key-here
EXPORT_KEY = your-export-api-key-here
DMS_BASE_URL = url-to-dms-service
```

**Optional secrets** (local development only):
```
# Set to 1 to auto-run setup before tests (convenient but slower)
# Default behaviour (unset): setup must be run manually
RUN_SETUP_AUTOMATICALLY = 1
```

### Workflow Triggers

- **Latest (`playwright-latest.yml`)**: Push to `main`/`master`, nightly schedule (9:55 PM UTC), manual dispatch with optional `environment` input (`new qa` default, or `new uat`)
- **Release (`playwright-release.yml`)**: Nightly schedule (11:55 PM UTC), manual dispatch with optional `tag` input (defaults to latest git tag); always targets `new uat`

### Authentication Lifecycle

Each test job is self-contained:
- **Functional Tests**: setup → tests with LandingPage-based real-time recovery
- **Non-Functional Tests**: setup → tests with LandingPage-based real-time recovery
- No shared artifacts or account conflicts
- Fresh authentication state for each project with streamlined fixture architecture

## Test Reports

**Artifacts generated** (2-day retention, on failure only), suffixed by environment (`-qa` or `-uat`):
- `functional-test-report-{env}` — Playwright HTML report for functional tests
- `non-functional-test-report-{env}` — Playwright HTML report for accessibility tests
- `non-functional-coverage-report-{env}` — Coverage summary (markdown + HTML)
- `api-test-report-{env}` — Playwright HTML report for API tests

**Access**: Repository → Actions → Workflow run → Artifacts section (bottom of page)

## Adding More Test Accounts

When scaling parallelization:

1. **Add GitHub secrets**: `TEST_ACCOUNT_N_EMAIL`, `TEST_ACCOUNT_N_PASSWORD`
2. **Update [`test-accounts.json`](../tests/config/test-accounts.json)** with new account entry
3. **Update workflow templates** in [`.github/workflows/`](../.github/workflows/) — update the setup step env vars in `template-functional-tests.yml` and `template-non-functional-tests.yml`
4. **Update [`playwright.config.ts`](../playwright.config.ts)** worker counts

### Account Usage

**Current Setup (2 accounts):**
- Both test jobs use the same 2 accounts
- LandingPage-based authentication recovery prevents all conflicts between sequential jobs
- Each job runs with 2 workers using `user-0.json` and `user-1.json`
- Streamlined fixtures with shared AuthUtils for reliable session management

**Future Scaling (4+ accounts):**
- Update `workers` count in [playwright.config.ts](../playwright.config.ts)
- All test jobs can use the same expanded account pool
- Authentication recovery prevents conflicts between jobs

## Workflow Configuration

### Docker Container

The `functional-tests` and `non-functional-tests` jobs run inside the official Playwright Docker container:

```yaml
container:
  image: mcr.microsoft.com/playwright:v1.57.0-jammy
```

Chromium is pre-installed in the image, so no separate browser download step is needed. This avoids dependency on the Playwright CDN during CI runs.

> **Version coupling**: the Docker image tag must match the `@playwright/test` version in `package-lock.json`. When upgrading Playwright, update `package.json`, run `npm install` to update the lockfile, and update the `container.image` tag in `.github/workflows/template-functional-tests.yml` and `.github/workflows/template-non-functional-tests.yml` to match.

The `api-tests` job is unaffected — it does not install or use browsers.

**Both test jobs** (require test credentials and BASE_URL):
```yaml
- name: Run authentication setup
  run: npx playwright test --project=setup
  env:
    TEST_ACCOUNT_1_EMAIL: ${{ secrets.TEST_ACCOUNT_1_EMAIL }}
    TEST_ACCOUNT_1_PASSWORD: ${{ secrets.TEST_ACCOUNT_1_PASSWORD }}
    TEST_ACCOUNT_2_EMAIL: ${{ secrets.TEST_ACCOUNT_2_EMAIL }}
    TEST_ACCOUNT_2_PASSWORD: ${{ secrets.TEST_ACCOUNT_2_PASSWORD }}
    BASE_URL: ${{ secrets.BASE_URL }}

- name: Run tests
  run: npx playwright test --project=functional  # or non-functional
  env:
    BASE_URL: ${{ secrets.BASE_URL }}

# Authentication recovery handles cleanup automatically - no manual teardown needed
```

- **Locally**: Environment variables are loaded from `.env` file via dotenv
- **GitHub Actions**: Variables are injected from repository secrets at runtime
- **Security**: Actual credentials are never stored in code or version control
- **Resolution**: The framework reads variable names from `test-accounts.json` and resolves them at runtime

## Workflow Triggers

| Workflow | Environment | Push | Schedule | Manual dispatch |
|---|---|---|---|---|
| `playwright-latest.yml` | `new qa` (default) or `new uat` | `main`, `master` | 9:55 PM UTC nightly | Optional `environment` input (`new qa` default) |
| `playwright-release.yml` | `new uat` (fixed) | — | 11:55 PM UTC nightly | Optional `tag` input (defaults to latest git tag) |

> **Note**: GitHub Actions scheduled workflows only run on the **default branch** (`main`). The Release workflow file lives on `main`, but its `resolve-tag` job checks out the correct tag before tests execute.

## UAT Release Tagging

The Release workflow (`playwright-release.yml`) uses git tags to pin the test version to what is deployed on `new uat`. Tags must be created manually as part of your release process.

### When to create a tag

Create a tag when the `new uat` environment has been updated with a new deployment and the corresponding test updates have been merged to `main`.

### How to create and push a tag

```bash
# Make sure you are on main and up to date
git checkout main
git pull

# List existing tags to determine the next version
git tag --sort=-version:refname

# Create an annotated tag (replace v1.0 with your version)
git tag -a v1.0 -m "UAT release v1.0"

# Push the tag to GitHub
git push origin v1.0
```

The next scheduled Release run (or a manual dispatch with no tag input) will automatically pick up the new tag.

### Running release tests against a specific tag

Use the manual dispatch on `playwright-release.yml` in GitHub Actions and enter the tag name in the `tag` input field (e.g. `v1.0`). Leave the field empty to always use the latest tag.

### Running the latest tests on UAT before tagging

Use the manual dispatch on `playwright-latest.yml` and select `new uat` as the environment. This runs the latest (untagged) automation code against the `new uat` environment, allowing you to verify tests pass before creating a release tag.

### First-time setup

Before the Release workflow runs for the first time, at least one tag must exist. Create the initial tag when both environments are in sync:

```bash
git tag -a v1.0 -m "Initial UAT baseline"
git push origin v1.0
```

## Parallel Execution in CI/CD

The CI/CD pipeline is optimized for execution at multiple levels:

**Job-level Execution:**
- Functional tests run first, followed by non-functional tests
- Each job is self-contained with its own authentication lifecycle
- Sequential execution prevents resource conflicts

**Worker-level Parallelization:**
- Multiple workers run concurrently within each test job
- Each worker uses its own authenticated session file
- Worker count should match the number of configured test accounts
- Faster feedback on test results within each job

## Authentication Lifecycle Management

Each test job handles its own authentication lifecycle:

1. **Test Job Start**: 
   - Runs `project=setup` to authenticate all test accounts
   - Creates fresh auth files: `user-0.json`, `user-1.json`, etc.
   - Saves auth state files to `playwright/auth-states/` directory

2. **Test Execution**:
   - Workers load their assigned auth files (`user-0.json`, `user-1.json`)
   - No account conflicts as each job runs independently
   - Tests execute with authenticated sessions

3. **Real-time Recovery**:
   - LandingPage-based authentication recovery detects and fixes sessions at exact point of need
   - Shared AuthUtils.saveAuthState() ensures consistent session management
   - Streamlined fixtures delegate recovery to page-level detection
   - Prevents session conflicts between different test projects with simplified architecture

## Account Strategy

Simplified approach with authentication recovery:

**Current Setup (2 accounts):**
- Both jobs use the same 2 test accounts
- No conflicts due to sequential execution with automatic recovery
- Each job: setup → tests (2 workers) with recovery

**Future Scaling (4+ accounts):**
- All jobs can use the same expanded account pool
- Increase `workers` count in [playwright.config.ts](../playwright.config.ts) to match available accounts
- LandingPage-based recovery with shared AuthUtils ensures clean state between jobs
- Simplified architecture requires no complex management

## Test Reports and Artifacts

Each test job generates and uploads artifacts on failure. Artifact names are suffixed with the environment (`-qa` or `-uat`):

### Playwright HTML Reports

- **Functional tests:** `functional-test-report-{env}` artifact
- **Non-functional tests:** `non-functional-test-report-{env}` artifact
- **API tests:** `api-test-report-{env}` artifact
- **Contains:** Detailed test execution results, screenshots, traces
- **Retention:** 2 days

### Non-Functional Test Coverage Reports

- **Non-functional tests:** `non-functional-coverage-report-{env}` artifact
- **Format:** Both Markdown (`.md`) and HTML (`.html`) versions
- **Contains:** 
  - Summary table of pages tested
  - Test types performed on each page (Accessibility, Context Verification, etc.)
  - Accessibility violation counts
  - Test execution status and detailed results
- **Retention:** 2 days

### Accessing Reports

1. Navigate to the **Actions** tab in your GitHub repository
2. Click on a workflow run
3. Scroll to the **Artifacts** section at the bottom
4. Download the report artifacts you need
5. Extract and open the HTML files in your browser

### Example Workflow Configuration

```yaml
- name: Upload Playwright HTML report
  uses: actions/upload-artifact@v4
  if: ${{ failure() }}
  with:
    name: non-functional-test-report-qa
    path: playwright-report/
    retention-days: 2

- name: Upload Non-Functional Test Coverage Report
  uses: actions/upload-artifact@v4
  if: ${{ failure() }}
  with:
    name: non-functional-coverage-report-qa
    path: test-results/non-functional-test-coverage.*
    retention-days: 2
```

## Best Practices

1. **Keep secrets up to date** - Update GitHub secrets when credentials change
2. **Match worker counts** - Ensure `playwright.config.ts` workers match available test accounts
3. **Monitor workflow runs** - Check Actions tab for test results and failures
4. **Review test reports** - Download and review both Playwright HTML reports and coverage reports from artifacts
5. **Secure MFA accounts** - Use dedicated test accounts with MFA enabled
6. **Add annotations to tests** - Ensure all tests include proper annotations for accurate coverage reporting
