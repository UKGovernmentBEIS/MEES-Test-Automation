# CI/CD Configuration

## Overview

GitHub Actions pipeline for automated test execution with two-job architecture:

1. **Functional Tests** - Runs setup and functional tests with authentication recovery
2. **Non-Functional Tests** - Runs setup and accessibility/validation tests with authentication recovery (depends on functional tests completion)

**Benefits**: Each test project gets fresh authentication state, authentication recovery prevents conflicts, simplified workflow.

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
PROPERTY_KEY = your-api-key-here
LOCAL_AUTHORITIES_KEY=your-la-key-here
DMS_BASE_URL=url-to-dms-service
```

### Workflow Triggers

- Manual trigger (workflow_dispatch)

### Authentication Lifecycle

Each test job is self-contained:
- **Functional Tests**: setup → tests with automatic recovery
- **Non-Functional Tests**: setup → tests with automatic recovery
- No shared artifacts or account conflicts
- Fresh authentication state for each project

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
3. **Update [`.github/workflows/playwright.yml`](../.github/workflows/playwright.yml)** setup steps in both jobs
4. **Update [`playwright.config.ts`](../playwright.config.ts)** worker counts

### Account Usage

**Current Setup (2 accounts):**
- Both test jobs use the same 2 accounts
- Authentication recovery prevents conflicts between sequential jobs
- Each job runs with 2 workers using `user-0.json` and `user-1.json`

**Future Scaling (4+ accounts):**
- Update `workers` count in [playwright.config.ts](../playwright.config.ts)
- All test jobs can use the same expanded account pool
- Authentication recovery prevents conflicts between jobs

## Workflow Configuration

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

The current workflow is configured to run on:
- Every push to the repository
- Every pull request
- Manual trigger (workflow_dispatch)

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

3. **Automatic Recovery**:
   - Built-in authentication recovery handles session issues
   - Fresh authentication state created automatically when needed
   - Prevents session conflicts between different test projects

## Account Strategy

Simplified approach with authentication recovery:

**Current Setup (2 accounts):**
- Both jobs use the same 2 test accounts
- No conflicts due to sequential execution with automatic recovery
- Each job: setup → tests (2 workers) with recovery

**Future Scaling (4+ accounts):**
- All jobs can use the same expanded account pool
- Increase `workers` count in [playwright.config.ts](../playwright.config.ts) to match available accounts
- Authentication recovery ensures clean state between jobs
- No complex offset management required

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
