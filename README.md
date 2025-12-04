# MEES Test Automation Framework

Automated end-to-end testing framework for the MEES (Minimum Energy Efficiency Standards) Private Rented Sector Exemptions Register application using Playwright.

## Overview

This is a Proof of Concept (POC) project to prepare a Test Automation Framework for the MEES project. Currently, this POC uses PRSE (Private Rented Sector Exemptions) pages for testing, as they are similar to the MEES pages. The framework tests the registration flow, including authentication via GOV.UK One Login and Salesforce integration.

## Main Features

| Feature | Status |
|---------|--------|
| **CI Pipeline** | ✅ Done |
| **Parallel Execution using Configurable User Accounts** | ✅ Done |
| - Encrypted passwords | ✅ Done |
| **Parameterised Base URL** | 🔄 In Progress |
| **API Testing to Verify DMS Data** | ⏳ Not Done |
| **Accessibility Testing** | ⏳ Not Done |
| **Documentation** | ⏳ Not Done |

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

## Creating New Test Files

### Required Setup

1. **Import the custom test fixture:**
```typescript
import { test, expect } from '../fixtures/authFixtures';
```

2. **Add beforeEach for test isolation:**
```typescript
test.describe('Your Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Reset application state between tests
    await page.goto('https://desnz-gm--prseqa.sandbox.my.site.com/PRSExemptionsRegister');
    await page.waitForLoadState('domcontentloaded');
  });

  test('your test', async ({ page }) => {
    // Test code - user is already authenticated
  });
});
```

## Project Structure

```
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── config/
│   │   └── test-accounts.json    # Test account credentials (gitignored)
│   ├── fixtures/
│   │   └── authFixtures.ts       # Custom fixtures for shared context
│   ├── pages/                    # Page Object Models
│   ├── test/
│   │   └── *.spec.ts            # Test files
│   └── utils/
│       ├── auth.setup.ts         # Authentication setup (per worker)
│       └── ElementUtilities.ts
└── playwright/.auth/
    ├── user-0.json               # Worker 0 auth state
    ├── user-1.json               # Worker 1 auth state
    └── user-N.json               # Worker N auth state
```

## Test Accounts Configuration

### Setting Up User Accounts with Encrypted Passwords

The framework uses environment variables to securely store passwords, keeping them out of version control while working both locally and in GitHub Actions. For parallel execution, each worker requires its own GOV.UK One Login account with completed MFA setup.

#### Prerequisites for Test Accounts

⚠️ **Critical:** Each test account must:
1. Be a fully registered GOV.UK One Login account
2. Have completed MFA setup (text message or authenticator app)
3. Have logged into the application at least once to complete onboarding

If an account hasn't completed the "Finish creating your GOV.UK One Login" setup, the authentication will fail with a clear error message.

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

⚠️ **Important:** The `.env` file is gitignored and will never be committed to the repository.

3. **Verify `.env` is in `.gitignore`** (already configured):

```gitignore
# Environment variables (contains sensitive passwords)
.env
```

#### GitHub Actions Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each password as a separate secret using the **exact naming convention**:
   - Name: `TEST_ACCOUNT_1_EMAIL` (for first account)
   - Value: `test1@example.com`
   - Name: `TEST_ACCOUNT_1_PASSWORD`
   - Value: `YourActualPassword1!`
   - Continue with `TEST_ACCOUNT_2_EMAIL`, `TEST_ACCOUNT_2_PASSWORD`, etc.

5. **Update `.github/workflows/playwright.yml`** to explicitly pass secrets as environment variables:

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    TEST_ACCOUNT_1_PASSWORD: ${{ secrets.TEST_ACCOUNT_1_PASSWORD }}
    TEST_ACCOUNT_2_PASSWORD: ${{ secrets.TEST_ACCOUNT_2_PASSWORD }}
    TEST_ACCOUNT_3_PASSWORD: ${{ secrets.TEST_ACCOUNT_3_PASSWORD }}
    TEST_ACCOUNT_4_PASSWORD: ${{ secrets.TEST_ACCOUNT_4_PASSWORD }}
```

⚠️ **Important:** Each password environment variable must be explicitly listed in the workflow file. If you add more than 4 accounts, add additional lines following the same pattern.

#### How It Works

- The framework reads the password field from `test-accounts.json` (e.g., `"TEST_ACCOUNT_1_PASSWORD"`)
- It looks up that name in environment variables using `process.env`
- Locally: Variables are loaded from `.env` file via dotenv
- GitHub Actions: Variables are injected from repository secrets
- The actual password is resolved at runtime and never stored in code

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

4. **Add the secrets to GitHub Actions** (Settings → Secrets and variables → Actions):
   - `TEST_ACCOUNT_3_EMAIL`
   - `TEST_ACCOUNT_3_PASSWORD`

5. **Add the environment variables to `.github/workflows/playwright.yml`:**
   ```yaml
   env:
     TEST_ACCOUNT_3_EMAIL: ${{ secrets.TEST_ACCOUNT_3_EMAIL }}
     TEST_ACCOUNT_3_PASSWORD: ${{ secrets.TEST_ACCOUNT_3_PASSWORD }}
   ```

6. **Update `playwright.config.ts`** to increase workers:
   ```typescript
   workers: 3,  // Match the number of test accounts
   ```

7. **Update setup project workers** in `playwright.config.ts` (optional - can match account count):
   ```typescript
   projects: [
     { 
       name: 'setup',
       workers: 3  // Can match number of test accounts for faster setup
     }
   ]
   ```

**Naming Convention:** Always use `TEST_ACCOUNT_N_EMAIL` and `TEST_ACCOUNT_N_PASSWORD` where N is the account number (1, 2, 3, etc.). This ensures consistency across local development and CI/CD.

#### How Authentication Files Are Created

When you run tests, the setup project creates separate authentication files for each worker:

1. **Setup runs in parallel** (with `workers` matching number of accounts) for faster authentication
2. **Multiple test instances** are created - one for each account in `test-accounts.json`
3. **Each test authenticates** with its assigned account and saves to:
   - Worker 0 → `playwright/.auth/user-0.json`
   - Worker 1 → `playwright/.auth/user-1.json`
   - Worker N → `playwright/.auth/user-N.json`
4. **Test execution** then runs in parallel, with each worker loading its own auth file

**Example console output:**
```
[setup] › authentication setup - user 0
[Auth Setup] Saved authentication state to: playwright/.auth/user-0.json
[setup] › authentication setup - user 1
[Auth Setup] Saved authentication state to: playwright/.auth/user-1.json
``` ├── pages/                    # Page Object Models
│   │   ├── HomePage.ts
│   │   └── ExemptionRegister/
│   ├── test/
│   │   └── *.spec.ts            # Test files
│   └── utils/
│       └── ElementUtilities.ts
## Configuration

**Current Settings:**
- `fullyParallel: true` - Tests run in parallel for faster execution
- `workers: 2` - Two workers running concurrently (matches number of test accounts)
- Setup project: `workers: 2`, `fullyParallel: true` - Setup also runs in parallel for faster authentication
- Test accounts configured in `tests/config/test-accounts.json`
- Setup project runs before chromium tests via `dependencies: ['setup']`

**To Adjust Parallelization:**
1. Match `workers` count to the number of test accounts in `tests/config/test-accounts.json`
2. Each worker needs a separate, fully configured GOV.UK One Login account
3. Setup project `workers` can also match account count for faster setup
4. More workers = faster test execution (up to the number of available CPU cores)

## Authentication Flow

### Setup Phase (Parallel)

1. **Setup project runs** with multiple workers for faster authentication
2. **For each account** in `test-accounts.json`:
   - Navigates to home page
   - Clicks "Start now" → GOV.UK One Login
   - Enters credentials and authenticates
   - Checks for incomplete account setup (MFA not configured)
   - Saves cookies/state to `playwright/.auth/user-{N}.json`
3. **Validation**: Verifies all accounts reach the application's main page

### Test Execution Phase (Parallel)

1. **Each worker** loads its specific auth file:
   - Worker 0 → loads `user-0.json`
   - Worker 1 → loads `user-1.json`
   - Worker N → loads `user-N.json`
2. **Auth state** is loaded into a worker-scoped browser context
3. **All tests** in that worker reuse the authenticated session
4. **Each test** gets a new page but maintains authentication

### Running Tests

```bash
# Run all tests (setup + actual tests)
npx playwright test

# Run only setup to refresh authentication
npx playwright test --project=setup

# Run specific test
npx playwright test --grep "test name"

# View report
npx playwright show-report
```

## Troubleshooting

**Authentication fails in tests:**
- Run `npx playwright test --project=setup` to refresh authentication state
- Verify all accounts in `tests/config/test-accounts.json` are registered and valid
- Check if `playwright/.auth/user-*.json` files exist for all workers
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
- Verify all auth files were created: `ls playwright/.auth/`

**Session expired:**
- Re-run setup project to capture fresh authentication
- Authentication state expires after ~30 minutes of inactivity
- Check for expired sessions: `npx playwright test --project=setup`

**Setup taking too long:**
- Setup runs in parallel with multiple workers
- Expected time: ~8-10 seconds per account (running concurrently)
- For 2 accounts with 2 workers: ~8-10 seconds total for setup
- Check network connectivity if authentication is slower than expected