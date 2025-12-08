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
| **API Testing to Verify DMS Data** | ⏸️ On Hold |
| **Accessibility Testing** | 🔄 In Progress |
| **Documentation** | 🔄 In Progress |

## Table of Contents

1. [Overview](#overview)
2. [Main Features](#main-features)
3. [Authentication](#authentication)
4. [Creating New Test Files](#creating-new-test-files)
5. [Project Structure](#project-structure)
6. [Configuration](#configuration)
7. [Accessibility Testing](#accessibility-testing)
8. [Running Tests](#running-tests)
9. [Troubleshooting](#troubleshooting)

## Authentication

The framework uses **Playwright's stored authentication state** to maintain user sessions across test runs, significantly improving performance and enabling parallel execution.

### Key Benefits

- **71% faster execution** when combined with parallel testing (4 workers)
- **No repeated logins** - authenticate once per test run
- **Parallel execution** - multiple workers with separate authenticated sessions
- **Secure credentials** - encrypted passwords using environment variables

### Quick Setup

1. **Configure test accounts** in `tests/config/test-accounts.json` using environment variable names
2. **Add credentials** to `.env` file locally or GitHub Actions secrets
3. **Run setup** to create authentication files: `npx playwright test --project=setup`
4. **Run tests** - each worker automatically loads its authenticated session

### How It Works

- **Setup Phase**: Each worker authenticates with GOV.UK One Login and saves session to `playwright/.auth/user-N.json`
- **Test Execution**: Workers reuse saved authentication state without re-logging in
- **Isolation**: Each test gets a fresh page while maintaining the authenticated session

📄 **For detailed configuration, troubleshooting, and performance metrics, see [Authentication Guide](Documentation/Authentication.md)**

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

## Accessibility Testing

The framework includes accessibility testing capabilities to ensure WCAG 2.1 AA compliance. Accessibility tests validate that the application meets web accessibility standards for users with disabilities.

### Approach

- **Automated Testing**: Using axe-core integration with Playwright for automated accessibility checks
- **Manual Testing**: Complementary manual testing for success criteria that cannot be fully automated
- **WCAG 2.1 AA Standard**: Targeting Level AA compliance as the baseline

### Coverage

For detailed information about which WCAG 2.1 AA success criteria can be automated, require hybrid testing, or need manual verification, see:

📄 **[WCAG 2.1 AA Coverage Documentation](Documentation/wcag_2_1_aa_coverage.md)**

This document categorizes all WCAG 2.1 Level A and AA success criteria by:
- ✅ Fully automatable with axe-core
- ⚠️ Hybrid (automation + manual/scripted testing)
- 👀 Manual testing only

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

### Authentication Issues

**Authentication fails or session expired:**
- Run `npx playwright test --project=setup` to refresh authentication state
- Verify environment variables are set correctly in `.env` file
- Check if `playwright/.auth/user-*.json` files exist

**"Finish creating your GOV.UK One Login" error:**
- Complete MFA setup for the test account
- Log into the account manually and finish setup
- Run setup again: `npx playwright test --project=setup`

**Missing authentication file:**
- Ensure enough test accounts match worker count in `playwright.config.ts`
- Run setup to create auth files: `npx playwright test --project=setup`

📄 **For comprehensive troubleshooting, see [Authentication Guide](Documentation/Authentication.md)**

### General Issues

**Tests fail unexpectedly:**
- Check test reports: `npx playwright show-report`
- Run with trace: `npx playwright test --trace on`
- Verify application is accessible and responsive