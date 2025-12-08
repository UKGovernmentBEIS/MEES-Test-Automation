# CI/CD Configuration

## Overview

The framework includes a GitHub Actions workflow for automated test execution on every push and pull request. This ensures continuous integration and early detection of issues.

## GitHub Actions Setup

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

Update `.github/workflows/playwright.yml` to pass secrets as environment variables:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    TEST_ACCOUNT_1_EMAIL: ${{ secrets.TEST_ACCOUNT_1_EMAIL }}
    TEST_ACCOUNT_1_PASSWORD: ${{ secrets.TEST_ACCOUNT_1_PASSWORD }}
    TEST_ACCOUNT_2_EMAIL: ${{ secrets.TEST_ACCOUNT_2_EMAIL }}
    TEST_ACCOUNT_2_PASSWORD: ${{ secrets.TEST_ACCOUNT_2_PASSWORD }}
    BASE_URL: ${{ secrets.BASE_URL }}
```

⚠️ **Important:** Each environment variable (email and password) must be explicitly listed in the workflow file.

### Adding More Test Accounts to CI/CD

When you add new test accounts for increased parallelization:

1. **Add the secrets to GitHub Actions** (Settings → Secrets and variables → Actions):
   - `TEST_ACCOUNT_N_EMAIL`
   - `TEST_ACCOUNT_N_PASSWORD`

2. **Update `.github/workflows/playwright.yml`** to include the new variables:
   ```yaml
   env:
     TEST_ACCOUNT_3_EMAIL: ${{ secrets.TEST_ACCOUNT_3_EMAIL }}
     TEST_ACCOUNT_3_PASSWORD: ${{ secrets.TEST_ACCOUNT_3_PASSWORD }}
   ```

3. **Update `playwright.config.ts`** to match the worker count if needed

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

The CI/CD pipeline supports the same parallel execution capabilities as local development:
- Multiple workers run concurrently
- Each worker uses its own authenticated session
- Worker count should match the number of configured test accounts
- Faster feedback on test results

## Best Practices

1. **Keep secrets up to date** - Update GitHub secrets when credentials change
2. **Match worker counts** - Ensure `playwright.config.ts` workers match available test accounts
3. **Monitor workflow runs** - Check Actions tab for test results and failures
4. **Review test reports** - Artifacts include HTML reports and trace files
5. **Secure MFA accounts** - Use dedicated test accounts with MFA enabled
