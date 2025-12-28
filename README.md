# MEES Test Automation Framework

Automated end-to-end testing framework for the MEES (Minimum Energy Efficiency Standards) Private Rented Sector Exemptions Register application using Playwright.

## Overview

This is a Proof of Concept (POC) project to prepare a Test Automation Framework for the MEES project. Currently, this POC uses PRSE (Private Rental Sector Exemptions) pages for testing, as they are similar to the MEES pages. The framework tests the registration flow, including authentication via GOV.UK One Login and Salesforce integration.

## Main Features

| Feature | Status |
|---------|--------|
| **CI Pipeline** | ✅ Done |
| **Parallel Execution using Configurable User Accounts** | ✅ Done |
| - Encrypted passwords | ✅ Done |
| **Parameterised Base URL** | ✅ Done |
| **API Testing to Verify DMS Data** | ⏸️ On Hold |
| **Accessibility Testing** | ✅ Done |
| **Documentation** | ✅ Done |

## Table of Contents

1. [Overview](#overview)
2. [Main Features](#main-features)
3. [Getting Started](#getting-started)
   - [Local Setup](#local-setup)
   - [CI/CD Setup](#cicd-setup)
4. [Running Tests](#running-tests)
5. [Authentication](#authentication)
6. [Creating New Test Files](#creating-new-test-files)
7. [Project Structure](#project-structure)
8. [Configuration](#configuration)
9. [Accessibility Testing](#accessibility-testing)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Local Setup

Follow these steps to set up the test framework on your local machine:

#### Prerequisites

- Node.js (v16 or higher)
- At least 2 GOV.UK One Login accounts with completed MFA setup
- Access to the MEES application environment

#### Installation Steps

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

2. **Create `.env` file in the project root:**
   
   Create a `.env` file with your test account credentials and configuration:
   
   ```env
   # Test Account Credentials
   TEST_ACCOUNT_1_EMAIL=your-email-1@example.com
   TEST_ACCOUNT_1_PASSWORD=YourPassword1!
   TEST_ACCOUNT_2_EMAIL=your-email-2@example.com
   TEST_ACCOUNT_2_PASSWORD=YourPassword2!
   
   # Application URL
   BASE_URL=https://desnz-gm--prseqa.sandbox.my.site.com/PRSExemptionsRegister
   ```
   
   ⚠️ **Important:** The `.env` file is gitignored and should never be committed to the repository.

3. **(Optional) For local development with UI mode:**
   
   Add this setting to your `.env` file to skip automatic setup execution:
   
   ```env
   # Local Development Only - Skip setup in UI mode
   SKIP_SETUP_DEPS=1
   ```
   
   ⚠️ **Do not set this in CI/CD** - setup must run automatically in pipelines.

4. **Verify test accounts configuration:**
   
   Ensure `tests/config/test-accounts.json` matches your `.env` variable names:
   
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

5. **Run authentication setup:**
   
   Create authentication session files (required before first test run):
   
   ```bash
   npx playwright test --project=setup
   ```
   
   This creates authentication files in `playwright/.auth/user-*.json`.

6. **Verify setup:**
   
   Run a test to verify everything is configured correctly:
   
   ```bash
   npx playwright test --grep "your test name"
   ```

#### Environment Variables Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `TEST_ACCOUNT_N_EMAIL` | Test user email addresses | `test@example.com` | ✅ Yes |
| `TEST_ACCOUNT_N_PASSWORD` | Test user passwords | `SecurePass123!` | ✅ Yes |
| `BASE_URL` | Application base URL | `https://app.example.com` | ✅ Yes |
| `SKIP_SETUP_DEPS` | Skip setup dependencies | `1` (skip) or `0` (run) | 🔧 Optional (local dev only) |

**About `SKIP_SETUP_DEPS` (Optional - Local Development Only):**
- When set to `1`, prevents authentication setup from running automatically
- Useful for local development with UI mode (`--ui`) to avoid repeated authentication
- Authentication files are reused until they expire (~30 minutes)
- **Must be unset or `0` in CI/CD** - pipelines require automatic setup execution
- If omitted, setup runs automatically before tests (recommended for CI/CD)

### CI/CD Setup

For configuring the framework in GitHub Actions and other CI/CD pipelines, see:

📄 **[CI/CD Configuration Guide](Documentation/CI-CD.md)**

This guide covers:
- Setting up GitHub Actions secrets
- Configuring encrypted passwords in CI
- Pipeline configuration and workflows

## Running Tests

**First Time / When Authentication Expires:**

Run authentication setup when session files don't exist or have expired:

```bash
# Create/refresh authentication files (stored in playwright/.auth/user-*.json)
npx playwright test --project=setup
```

**Note:** If `SKIP_SETUP_DEPS=1` in your `.env` file (see [Local Setup](#local-setup)), setup won't run automatically - you must run it manually. If `SKIP_SETUP_DEPS=0` or unset, setup runs automatically before tests.

**Regular Test Execution:**

```bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run tests with trace enabled (for debugging)
npx playwright test --trace on

# Run specific project
npx playwright test --project=functional
npx playwright test --project=accessibility

# Run specific test by name
npx playwright test -g "test name"

# Run test in UI mode (interactive debugging)
npx playwright test --ui

# View test report
npx playwright show-report

# Run functional test with provided text in the test name in UI mode
npx playwright test -g "details 01" --project=functional --ui
```

**Notes:**
- Authentication files are valid for ~30 minutes of inactivity
- With `SKIP_SETUP_DEPS=1`, setup doesn't run automatically - auth files must exist
- Setup runs automatically before tests when `SKIP_SETUP_DEPS=0` or unset

## Authentication

The framework uses **Playwright's stored authentication state** to maintain user sessions across test runs, avoiding repeated logins and enabling parallel execution with multiple test accounts.

📄 **For how authentication works, detailed configuration, performance metrics, and advanced setup, see [Authentication Guide](Documentation/Authentication.md)**

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

The framework includes accessibility testing to ensure WCAG 2.1 AA compliance using axe-core integration with Playwright.

**Quick Start:**
```bash
npx playwright test --project=accessibility
```

📄 **For comprehensive WCAG 2.1 AA criteria coverage and testing approach, see [Accessibility Testing Documentation](Documentation/Accessibility.md)**

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

**UI Mode (`--ui`) issues:**
- Recommended: Set `SKIP_SETUP_DEPS=1` in `.env` file to prevent setup from running in UI mode
- Before using UI mode, ensure auth files exist: `npx playwright test --project=setup`
- If authentication expires, temporarily set `SKIP_SETUP_DEPS=0`, run setup, then set back to `1`
- See [Local Setup](#local-setup) for `.env` configuration details

📄 **For comprehensive authentication troubleshooting, see [Authentication Guide](Documentation/Authentication.md)**

### General Issues

**Tests fail unexpectedly:**
- Check test reports: `npx playwright show-report`
- Run with trace: `npx playwright test --trace on`
- Verify application is accessible and responsive