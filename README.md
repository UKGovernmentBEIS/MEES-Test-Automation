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

The framework uses environment variables to securely store passwords, keeping them out of version control while working both locally and in GitHub Actions.

#### Local Setup

1. **Edit `tests/config/test-accounts.json`** - Use environment variable names instead of actual passwords:

```json
{
  "accounts": [
    {
      "email": "TEST_ACCOUNT_1_EMAIL",
      "password": "TEST_ACCOUNT_1_PASSWORD",
      "description": "Worker 0"
    },
    {
      "email": "TEST_ACCOUNT_2_EMAIL",
      "password": "TEST_ACCOUNT_2_PASSWORD",
      "description": "Worker 1"
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

#### Adding More Accounts

1. Register a new GOV.UK One Login account
2. Add entry to `test-accounts.json` following the naming convention:
   ```json
   {
     "email": "user3@example.com",
     "password": "TEST_ACCOUNT_3_PASSWORD",
     "description": "Worker 2"
   }
   ```
3. Add the actual password to `.env` locally:
   ```env
   TEST_ACCOUNT_3_PASSWORD=YourActualPassword3!
   ```
4. Add the secret to GitHub Actions (Settings → Secrets and variables → Actions)
5. **Add the environment variable to `.github/workflows/playwright.yml`**:
   ```yaml
   env:
     TEST_ACCOUNT_3_PASSWORD: ${{ secrets.TEST_ACCOUNT_3_PASSWORD }}
   ```

**Naming Convention:** Always use `TEST_ACCOUNT_N_PASSWORD` where N is the account number (1, 2, 3, etc.). This ensures consistency across local development and CI/CD.

**Note:** Register separate GOV.UK One Login accounts for each worker. The framework assigns accounts based on worker index. ├── pages/                    # Page Object Models
│   │   ├── HomePage.ts
│   │   └── ExemptionRegister/
│   ├── test/
│   │   └── *.spec.ts            # Test files
│   └── utils/
│       └── ElementUtilities.ts
## Configuration

**Current Settings:**
- `fullyParallel: false` - Sequential execution (single account)
- `workers: 1` - Single worker
- Account configured in `tests/config/test-accounts.json`
- Setup project runs before tests via `dependencies: ['setup']`

**For Parallel Execution:**
1. Register additional GOV.UK One Login accounts
2. Add accounts to `tests/config/test-accounts.json`
3. Update `playwright.config.ts`: set `fullyParallel: true` and `workers: 2` (or more)
4. Each worker will use a different account automatically
## Authentication Flow

1. Setup runs with multiple workers in parallel
2. Each worker selects account from `test-accounts.json` based on worker index
3. Worker authenticates and saves to `playwright/.auth/user-{N}.json`
4. Tests load worker-specific auth state into shared context
5. All tests in that worker reuse the authenticated session
npx playwright test --project=setup

# Run specific test
npx playwright test --grep "test name"

# View report
npx playwright show-report
```

## Configuration

**Key Settings:**
- `fullyParallel: false` - Tests run sequentially to share browser context
- `workers: 1` - Single worker ensures context sharing
- Setup project runs before chromium tests via `dependencies: ['setup']`

## Authentication Flow

1. Setup project navigates to home page
2. Clicks "Start now" → GOV.UK One Login
3. Enters credentials and authenticates
4. Saves cookies/state to `playwright/.auth/user.json`
5. Tests load this state into a shared worker context
6. All tests reuse the authenticated session

## Troubleshooting

**Authentication fails in tests:**
- Run `npx playwright test --project=setup` to refresh authentication state
- Verify all accounts in `tests/config/test-accounts.json` are registered and valid
- Check if `playwright/.auth/user-*.json` files exist

**Parallel execution issues:**
- Ensure you have enough registered test accounts in `tests/config/test-accounts.json` (one per worker)
- Each account must be a separate GOV.UK One Login registration
- Set `workers` count to match number of available accounts

**Session expired:**
- Re-run setup project to capture fresh authentication
- Authentication state expires after ~30 minutes of inactivity
