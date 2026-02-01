# Authentication Guide

## What It Is

**Stored Authentication State**: Playwright saves browser cookies and session data after initial login, allowing tests to reuse authentication without repeated login flows.

## Why It's Needed

- **Speed**: Avoids 10+ seconds of GOV.UK One Login flow per test
- **Parallel execution**: Each worker uses separate authenticated session 
- **Reliability**: Reduces authentication-related test failures
- **Performance**: 34-38% speed improvement, up to 71% with parallelization

## How It Works

1. **Setup project** authenticates each test account and saves session cookies to `playwright/auth-states/user-N.json`
2. **Test workers** load their assigned session file (user-0.json, user-1.json, etc.)
3. **Tests run** immediately with authenticated sessions - no login required
4. **Sessions expire** after ~30 minutes of inactivity

## Test Account Requirements

Each test account must:
- Be a complete GOV.UK One Login account
- Have MFA setup completed (SMS or authenticator app)
- Be registered in the target application
- Have logged into the application at least once manually

## Setup

### 1. Configure Test Accounts

**File**: `tests/config/test-accounts.json`
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

### 2. Local Environment Variables

**File**: `.env` (create in project root)
```env
TEST_ACCOUNT_1_EMAIL=user1@example.com
TEST_ACCOUNT_1_PASSWORD=Password123!
TEST_ACCOUNT_2_EMAIL=user2@example.com
TEST_ACCOUNT_2_PASSWORD=Password456!
```

### 3. Run Authentication Setup

```bash
# Creates auth files: playwright/auth-states/user-0.json, user-1.json, etc.
npx playwright test --project=setup
```

## Troubleshooting

**Setup fails**: 
- Verify test accounts have completed MFA setup
- Manually log into each account once to confirm they work

**Session expired**:
- Re-run setup: `npx playwright test --project=setup`
- Auth files are valid for ~30 minutes of inactivity

**Missing auth files**:
- Ensure worker count matches number of test accounts
- Run setup to create all required auth files

**Parallel execution issues**:
- Each worker needs its own test account
- Accounts cannot be shared between parallel workers
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
   - Navigates to the Landing page
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
