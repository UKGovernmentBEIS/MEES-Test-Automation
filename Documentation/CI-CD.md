# CI/CD Configuration

## Overview

GitHub Actions pipeline for automated test execution with three-job architecture:

1. **Setup** - Authenticates all test accounts, saves auth artifacts
2. **Functional Tests** - Downloads auth artifacts, runs functional tests (parallel with #3)
3. **Non-Functional Tests** - Downloads auth artifacts, runs accessibility/validation tests (parallel with #2)

**Benefits**: Authentication runs once, test jobs run in parallel, faster overall execution.

## GitHub Actions Setup

### Configure Repository Secrets

**Path**: Repository Settings → Secrets and variables → Actions

**Required secrets**:
```
TEST_ACCOUNT_1_EMAIL = user1@example.com
TEST_ACCOUNT_1_PASSWORD = Password123!
TEST_ACCOUNT_2_EMAIL = user2@example.com  
TEST_ACCOUNT_2_PASSWORD = Password456!
BASE_URL = https://your-app-url.com
PROPERTIES_KEY = your-api-key-here
DMS_URL=url-to-dms-service
```

### Workflow Triggers

- Manual trigger (workflow_dispatch)

### Authentication Artifacts

Setup job creates `playwright-auth` artifact containing session files:
- `user-0.json`, `user-1.json`, etc.
- Downloaded by test jobs before execution
- 1-day retention
- Prevents account conflicts in parallel jobs via `AUTH_WORKER_OFFSET`

## Test Reports

**Artifacts generated** (30-day retention):
- `functional-test-report` - Playwright HTML report for functional tests
- `non-functional-test-report` - Playwright HTML report for accessibility tests  
- `non-functional-coverage-report` - Coverage summary (markdown + HTML)

**Access**: Repository → Actions → Workflow run → Artifacts section (bottom of page)

## Adding More Test Accounts

When scaling parallelization:

1. **Add GitHub secrets**: `TEST_ACCOUNT_N_EMAIL`, `TEST_ACCOUNT_N_PASSWORD`
2. **Update [`test-accounts.json`](../tests/config/test-accounts.json)** with new account entry
3. **Update [`.github/workflows/playwright.yml`](../.github/workflows/playwright.yml)** setup job env vars
4. **Update [`playwright.config.ts`](../playwright.config.ts)** worker counts
5. **Adjust `AUTH_WORKER_OFFSET`** for each test job to prevent account conflicts

### Account Allocation Example

**4 accounts, 2 workers each**:
- Functional tests: `AUTH_WORKER_OFFSET=0` → uses accounts 0-1
- Non-functional tests: `AUTH_WORKER_OFFSET=2` → uses accounts 2-3
- No conflicts, full parallelization

## Workflow Configuration

**Setup job** (requires all test credentials):
```yaml
env:
  TEST_ACCOUNT_1_EMAIL: ${{ secrets.TEST_ACCOUNT_1_EMAIL }}
  TEST_ACCOUNT_1_PASSWORD: ${{ secrets.TEST_ACCOUNT_1_PASSWORD }}
  # ... all test accounts
  BASE_URL: ${{ secrets.BASE_URL }}
```

**Test jobs** (only need BASE_URL, use downloaded auth artifacts):
```yaml
env:
  BASE_URL: ${{ secrets.BASE_URL }}
  AUTH_WORKER_OFFSET: 0  # or 2 for non-functional
```

- **Locally**: Environment variables are loaded from `.env` file via dotenv
- **GitHub Actions**: Variables are injected from repository secrets at runtime
- **Security**: Actual credentials are never stored in code or version control
- **Resolution**: The framework reads variable names from `test-accounts.json` and resolves them at runtime

## Workflow Triggers

The current workflow is configured to run on:
- Every push to the repository
- Every pull request
- Manual trigger (workflow_dispatch)

## Parallel Execution in CI/CD

The CI/CD pipeline is optimized for parallel execution at multiple levels:

**Job-level Parallelization:**
- Functional and accessibility test jobs run in parallel after setup completes
- Each job runs independently on separate runners
- Reduces total pipeline execution time

**Worker-level Parallelization:**
- Multiple workers run concurrently within each test job
- Each worker uses its own authenticated session from downloaded artifacts
- Worker count should match the number of configured test accounts
- Faster feedback on test results

## Authentication State Artifacts

The setup job creates authentication state files that are shared across test jobs:

1. **Setup Job**: 
   - Runs `project=setup` to authenticate all test accounts
   - Creates auth files: `user-0.json`, `user-1.json`, etc.
   - Saves auth state files to `playwright/auth-states/` directory
   - Uploads the directory as a GitHub Actions artifact (retention: 1 day)

2. **Test Jobs**:
   - Download the `playwright-auth` artifact before running tests
   - Extract auth files to `playwright/auth-states/` directory
   - Each job uses a dedicated account via `AUTH_WORKER_OFFSET`:
     - **Functional tests**: `AUTH_WORKER_OFFSET=0` → uses `user-0.json`
     - **Accessibility tests**: `AUTH_WORKER_OFFSET=1` → uses `user-1.json`
   - This prevents account conflicts when jobs run in parallel
   - No credentials needed in test jobs (already authenticated)

## Account Allocation Strategy

To enable parallel execution without account conflicts:

**Current Setup (2 accounts):**
- Account 0 (TEST_ACCOUNT_1_*) → Functional tests
- Account 1 (TEST_ACCOUNT_2_*) → Non-functional tests
- Each job runs with 1 worker
- Jobs execute in parallel safely

**Future Scaling (4+ accounts):**
- Accounts 0-1 → Functional tests (2 workers)
- Accounts 2-3 → Non-functional tests (2 workers)
- Update `AUTH_WORKER_OFFSET` for each job
- Update `workers` count in [playwright.config.ts](../playwright.config.ts)
- Jobs still execute in parallel without conflicts

## Test Reports and Artifacts

Each test job in the CI/CD pipeline generates and uploads test reports as artifacts:

### Playwright HTML Reports

- **Functional tests:** `functional-test-report` artifact
- **Non-functional tests:** `non-functional-test-report` artifact
- **Contains:** Detailed test execution results, screenshots, traces
- **Retention:** 30 days

### Non-Functional Test Coverage Reports

- **Non-functional tests:** `non-functional-coverage-report` artifact
- **Format:** Both Markdown (`.md`) and HTML (`.html`) versions
- **Contains:** 
  - Summary table of pages tested
  - Test types performed on each page (Accessibility, Context Verification, etc.)
  - Accessibility violation counts
  - Test execution status and detailed results
- **Retention:** 30 days

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
  if: ${{ !cancelled() }}
  with:
    name: non-functional-test-report
    path: playwright-report/
    retention-days: 30

- name: Upload Non-Functional Test Coverage Report
  uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: non-functional-coverage-report
    path: test-results/non-functional-test-coverage.*
    retention-days: 30
```

## Best Practices

1. **Keep secrets up to date** - Update GitHub secrets when credentials change
2. **Match worker counts** - Ensure `playwright.config.ts` workers match available test accounts
3. **Monitor workflow runs** - Check Actions tab for test results and failures
4. **Review test reports** - Download and review both Playwright HTML reports and coverage reports from artifacts
5. **Secure MFA accounts** - Use dedicated test accounts with MFA enabled
6. **Add annotations to tests** - Ensure all tests include proper annotations for accurate coverage reporting
