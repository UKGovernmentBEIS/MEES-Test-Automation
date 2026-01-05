# CI/CD Configuration

## Overview

The framework includes a GitHub Actions workflow for automated test execution on every push and pull request. This ensures continuous integration and early detection of issues.

## GitHub Actions Setup

### Pipeline Architecture

The CI/CD pipeline uses a **three-job architecture** optimized for speed and efficiency:

1. **Setup Job** - Runs authentication for all test accounts and creates auth artifacts
2. **Functional Tests Job** - Downloads auth artifacts and runs functional tests (depends on setup)
3. **Accessibility Tests Job** - Downloads auth artifacts and runs accessibility tests (depends on setup)

**Benefits:**
- Authentication runs **once** instead of being duplicated in each test job
- Functional and accessibility tests run **in parallel** after setup completes
- Faster pipeline execution and reduced CI/CD minutes
- Single point of authentication reduces failure points

### Configuring Secrets

Test account credentials are stored as GitHub repository secrets to keep them secure and out of version control.

#### Steps to Configure Secrets

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Add each credential as a repository secret:
   - `TEST_ACCOUNT_1_EMAIL` = `test1@example.com`
   - `TEST_ACCOUNT_1_PASSWORD` = `YourActualPassword1!`
   - `TEST_ACCOUNT_2_EMAIL` = `test2@example.com`
   - `TEST_ACCOUNT_2_PASSWORD` = `YourActualPassword2!`
   - Continue for additional accounts...
   - `BASE_URL` = Your application base URL

#### Workflow Configuration

The setup job requires test account credentials:

```yaml
- name: Run authentication setup
  run: npx playwright test --project=setup
  env:
    TEST_ACCOUNT_1_EMAIL: ${{ secrets.TEST_ACCOUNT_1_EMAIL }}
    TEST_ACCOUNT_1_PASSWORD: ${{ secrets.TEST_ACCOUNT_1_PASSWORD }}
    TEST_ACCOUNT_2_EMAIL: ${{ secrets.TEST_ACCOUNT_2_EMAIL }}
    TEST_ACCOUNT_2_PASSWORD: ${{ secrets.TEST_ACCOUNT_2_PASSWORD }}
    BASE_URL: ${{ secrets.BASE_URL }}
```

Test jobs only need the base URL since they use downloaded auth artifacts:

```yaml
- name: Run functional tests
  run: npx playwright test --project=functional
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
```

⚠️ **Important:** Each test account environment variable (email and password) must be explicitly listed in the setup job.

### Adding More Test Accounts to CI/CD

When you add new test accounts for increased parallelization:

1. **Add the secrets to GitHub Actions** (Settings → Secrets and variables → Actions):
   - `TEST_ACCOUNT_N_EMAIL`
   - `TEST_ACCOUNT_N_PASSWORD`

2. **Update [tests/config/test-accounts.json](../tests/config/test-accounts.json)** to include the new account

3. **Update [.github/workflows/playwright.yml](../.github/workflows/playwright.yml)** setup job to include the new variables:
   ```yaml
   env:
     TEST_ACCOUNT_3_EMAIL: ${{ secrets.TEST_ACCOUNT_3_EMAIL }}
     TEST_ACCOUNT_3_PASSWORD: ${{ secrets.TEST_ACCOUNT_3_PASSWORD }}
   ```

4. **Update [playwright.config.ts](../playwright.config.ts)** worker counts:
   - `setup` project: Match total number of accounts
   - `functional` project: Set workers for functional tests
   - `accessibility` project: Set workers for accessibility tests

5. **Adjust `AUTH_WORKER_OFFSET`** in the workflow:
   - Functional tests: Offset 0 (uses accounts 0, 1, 2...)
   - Accessibility tests: Offset = number of functional workers (uses remaining accounts)
   
   Example with 4 accounts:
   - Functional: `AUTH_WORKER_OFFSET=0`, `workers: 2` → uses accounts 0-1
   - Accessibility: `AUTH_WORKER_OFFSET=2`, `workers: 2` → uses accounts 2-3

### How It Works

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
- Account 1 (TEST_ACCOUNT_2_*) → Accessibility tests
- Each job runs with 1 worker
- Jobs execute in parallel safely

**Future Scaling (4+ accounts):**
- Accounts 0-1 → Functional tests (2 workers)
- Accounts 2-3 → Accessibility tests (2 workers)
- Update `AUTH_WORKER_OFFSET` for each job
- Update `workers` count in [playwright.config.ts](../playwright.config.ts)
- Jobs still execute in parallel without conflicts

## Best Practices

1. **Keep secrets up to date** - Update GitHub secrets when credentials change
2. **Match worker counts** - Ensure `playwright.config.ts` workers match available test accounts
3. **Monitor workflow runs** - Check Actions tab for test results and failures
4. **Review test reports** - Artifacts include HTML reports and trace files
5. **Secure MFA accounts** - Use dedicated test accounts with MFA enabled
