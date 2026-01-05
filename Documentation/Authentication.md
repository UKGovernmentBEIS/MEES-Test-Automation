# Authentication Guide

## Overview

This framework uses **Playwright's stored authentication state** to maintain user sessions across test runs. This approach significantly improves test execution speed by avoiding repeated login flows while enabling parallel test execution with multiple user accounts.

## Stored Authentication State

### What is Stored Authentication State?

Playwright's **stored authentication state** saves browser cookies, localStorage, and session data after initial authentication. Tests reuse this state instead of re-authenticating each time.

### Performance Impact (30 tests example)

| Approach | Workers | Stored Auth? | Time | Performance |
|----------|---------|--------------|------|-------------|
| Sequential | 1 | ✅ Yes | 370s (6.2 min) | Baseline |
| Sequential | 1 | ❌ No | 600s (10 min) | 1.6x slower |
| Parallel | 2 | ✅ Yes | **190s (3.2 min)** | 2x faster ⚡ |
| Parallel | 2 | ❌ No | 300s (5 min) | 1.2x slower |
| Parallel | 4 | ✅ Yes | **106s (1.8 min)** | 3.5x faster ⚡⚡ |
| Parallel | 4 | ❌ No | 160s (2.7 min) | 1.5x slower |

**Key Insight:** Stored auth provides 34-38% speed improvement even with parallel execution. Combined with parallelization, it delivers up to **71% time savings**.

### How We Use It

1. **Setup Project** (`tests/test/auth.setup.ts`) - Authenticates and saves state per worker
2. **Test Execution** - Each worker loads its auth state into a shared context
3. **Test Accounts** (`tests/config/test-accounts.json`) - Multiple accounts enable parallel execution
4. **Test Isolation** - Each test gets a new page but reuses authenticated context

## Test Accounts Configuration

### Setting Up User Accounts with Encrypted Passwords

The framework uses environment variables to securely store passwords, keeping them out of version control while working both locally and in GitHub Actions. For parallel execution, each worker requires its own GOV.UK One Login account with completed MFA setup.

#### Prerequisites

⚠️ Each test account must:
1. Be a fully registered GOV.UK One Login account
2. Have completed MFA setup (text message or authenticator app)
3. Have logged into the application at least once

#### Local Setup

1. **Edit `tests/config/test-accounts.json`** - Use environment variable names instead of actual passwords:

```json
{
  "accounts": [
    {
      "email": "TEST_ACCOUNT_1_EMAIL",
      "password": "TEST_ACCOUNT_1_PASSWORD",
      "description": "Primary test account - Worker 0"
    },
    {
      "email": "TEST_ACCOUNT_2_EMAIL",
      "password": "TEST_ACCOUNT_2_PASSWORD",
      "description": "Secondary test account - Worker 1"
    }
  ]
}
```

2. **Create `.env` file in project root** with actual passwords:

```env
TEST_ACCOUNT_1_EMAIL=test1@example.com
TEST_ACCOUNT_1_PASSWORD=YourActualPassword1!
TEST_ACCOUNT_2_EMAIL=test2@example.com
TEST_ACCOUNT_2_PASSWORD=YourActualPassword2!
```

⚠️ **Important:** The `.env` file is gitignored and never committed to the repository.

#### GitHub Actions / CI/CD Setup

For configuring test accounts in GitHub Actions and CI/CD pipelines, see:

📄 **[CI/CD Configuration Guide](CI-CD.md)**

#### How It Works

- The framework reads variable names from `test-accounts.json` (e.g., `TEST_ACCOUNT_1_EMAIL`)
- Locally: Variables are loaded from `.env` file via dotenv
- GitHub Actions: Variables are injected from repository secrets
- Actual credentials are resolved at runtime and never stored in code

#### Adding More Accounts for Increased Parallelization

To increase parallelization, add more test accounts. Each worker needs its own account.

1. Register a new GOV.UK One Login account
2. Add entry to `test-accounts.json` following the naming convention:
   ```json
   {
     "email": "TEST_ACCOUNT_3_EMAIL",
     "password": "TEST_ACCOUNT_3_PASSWORD",
     "description": "Additional test account - Worker 2"
   }
   ```

3. **Add the credentials to `.env` locally:**
   ```env
   TEST_ACCOUNT_3_EMAIL=test3@example.com
   TEST_ACCOUNT_3_PASSWORD=YourActualPassword3!
   ```

4. **For GitHub Actions / CI/CD**, see the [CI/CD Configuration Guide](CI-CD.md) for adding secrets

5. **Update `playwright.config.ts`** to match the number of accounts:
   ```typescript
   workers: 3,  // Match number of test accounts
   ```
   ```typescript
   projects: [
     { 
       name: 'setup',
       workers: 3  // Match for faster parallel setup
     }
   ]
   ```

**Naming Convention:** Use `TEST_ACCOUNT_N_EMAIL` and `TEST_ACCOUNT_N_PASSWORD` where N is the account number (1, 2, 3...).

#### How Authentication Files Are Created

When you run tests, the setup project creates separate authentication files for each worker:

1. **Setup runs in parallel** (with `workers` matching number of accounts) for faster authentication
2. **Multiple test instances** are created - one for each account in `test-accounts.json`
3. **Each test authenticates** with its assigned account and saves to:
   - Worker 0 → `playwright/auth-states/user-0.json`
   - Worker 1 → `playwright/auth-states/user-1.json`
   - Worker N → `playwright/auth-states/user-N.json`
4. **Test execution** then runs in parallel, with each worker loading its own auth file

**Example console output:**
```
[setup] › authentication setup - user 0
[Auth Setup] Saved authentication state to: playwright/auth-states/user-0.json
[setup] › authentication setup - user 1
[Auth Setup] Saved authentication state to: playwright/auth-states/user-1.json
```

## Authentication Flow

### Setup Phase (Parallel)

1. **Setup project runs** with multiple workers for faster authentication
2. **For each account** in `test-accounts.json`:
   - Navigates to home page
   - Clicks "Start now" → GOV.UK One Login
   - Enters credentials and authenticates
   - Checks for incomplete account setup (MFA not configured)
   - Saves cookies/state to `playwright/auth-states/user-{N}.json`
3. **Validation**: Verifies all accounts reach the application's main page

### Test Execution Phase (Parallel)

1. **Each worker** loads its specific auth file:
   - Worker 0 → loads `user-0.json`
   - Worker 1 → loads `user-1.json`
   - Worker N → loads `user-N.json`
2. **Auth state** is loaded into a worker-scoped browser context
3. **All tests** in that worker reuse the authenticated session
4. **Each test** gets a new page but maintains authentication

### Account Allocation in CI/CD (AUTH_WORKER_OFFSET)

**Note:** This is only required for CI/CD pipelines when running multiple test jobs in parallel. Local test execution does not need `AUTH_WORKER_OFFSET` since you run one project at a time.

When running multiple test jobs in parallel in CI/CD (e.g., functional and accessibility tests), you can allocate different accounts to each job using the `AUTH_WORKER_OFFSET` environment variable. This prevents account conflicts.

**The Problem Without AUTH_WORKER_OFFSET:**

In CI/CD, each GitHub Actions job is a separate Playwright process. The `workerIndex` **always starts at 0** for each job, even when jobs run simultaneously:

```bash
# Without AUTH_WORKER_OFFSET - BOTH JOBS RUN AT THE SAME TIME ❌

Job: functional-tests (separate GitHub runner)
├─ Worker 0 (workerIndex = 0) → loads user-0.json

Job: accessibility-tests (separate GitHub runner, parallel)
├─ Worker 0 (workerIndex = 0) → loads user-0.json  ⚠️ CONFLICT!

# Both jobs try to use TEST_ACCOUNT_1 simultaneously in the application
# This causes authentication conflicts and test failures
```

**The Solution - AUTH_WORKER_OFFSET (Set in CI/CD Pipeline):**

The offset is configured in [.github/workflows/playwright.yml](../.github/workflows/playwright.yml) and shifts which accounts each job uses:

```
accountIndex = workerIndex + AUTH_WORKER_OFFSET
```

**Example with 2 accounts:**
```bash
# Functional tests job (in playwright.yml)
AUTH_WORKER_OFFSET=0
Worker 0: 0 + 0 = 0 → uses user-0.json (TEST_ACCOUNT_1)

# Accessibility tests job (in playwright.yml, running in parallel)
AUTH_WORKER_OFFSET=1
Worker 0: 0 + 1 = 1 → uses user-1.json (TEST_ACCOUNT_2)

# Result: Different accounts, no conflicts, both jobs run in parallel ✅
```

**Example with 4 accounts:**
```bash
# Functional tests job (2 workers)
AUTH_WORKER_OFFSET=0
Worker 0: 0 + 0 = 0 → uses user-0.json
Worker 1: 1 + 0 = 1 → uses user-1.json

# Accessibility tests job (2 workers)
AUTH_WORKER_OFFSET=2
Worker 0: 0 + 2 = 2 → uses user-2.json
Worker 1: 1 + 2 = 3 → uses user-3.json

# Result: 4 separate accounts, no conflicts ✅
```

For CI/CD configuration details, see the **[CI/CD Configuration Guide](CI-CD.md)**.

## Troubleshooting

**Authentication fails in tests:**
- Run `npx playwright test --project=setup` to refresh authentication state
- Verify all accounts in `tests/config/test-accounts.json` are registered and valid
- Check if `playwright/auth-states/user-*.json` files exist for all workers
- Verify environment variables are set correctly in `.env` file

**"Finish creating your GOV.UK One Login" error:**
- This means a test account hasn't completed MFA setup
- Log into the account manually at the application URL
- Complete the MFA setup (text message or authenticator app)
- Run setup again: `npx playwright test --project=setup`

**Missing authentication file (user-N.json not found):**
- Ensure you have enough test accounts in `tests/config/test-accounts.json` (one per worker)
- Reduce `workers` in `playwright.config.ts` to match available accounts
- Run setup to create all auth files: `npx playwright test --project=setup`

**Parallel execution issues:**
- Each account must be a separate, fully registered GOV.UK One Login account
- Match `workers` count to the number of available test accounts
- Ensure all accounts have completed MFA setup before running tests
- Verify all auth files were created: `ls playwright/auth-states/`

**Session expired:**
- Re-run setup project to capture fresh authentication
- Authentication state expires after ~30 minutes of inactivity
- Check for expired sessions: `npx playwright test --project=setup`

**Setup taking too long:**
- Setup runs in parallel with multiple workers
- Expected time: ~8-10 seconds per account (running concurrently)
- For 2 accounts with 2 workers: ~8-10 seconds total for setup
- Check network connectivity if authentication is slower than expected
