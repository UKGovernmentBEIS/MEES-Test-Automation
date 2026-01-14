# MEES Test Automation Framework

Automated end-to-end testing framework for the MEES (Minimum Energy Efficiency Standards) Private Rented Sector Exemptions Register application using Playwright.

## Overview

This is a Proof of Concept (POC) project to prepare a Test Automation Framework for the MEES project. Currently, this POC uses PRSE (Private Rental Sector Exemptions) pages for testing, as they are similar to the MEES pages. The framework tests the registration flow, including authentication via GOV.UK One Login and Salesforce integration.

## Main Features

| Feature | Status |
|---------|--------|
| **CI/CD Pipeline** | ✅ Done |
| **Parallel Execution using Configurable User Accounts** | ✅ Done |
| - Encrypted passwords | ✅ Done |
| **Parameterised Base URL** | ✅ Done |
| **Authentication Setup & State Management** | ✅ Done |
| **Page Object Model Architecture** | ✅ Done |
| **Accessibility Testing (WCAG 2.2 AA)** | ✅ Done |
| **Context Testing & Verification** | ✅ Done |
| **Non-Functional Test Coverage Reporting** | ✅ Done |
| **Test Utilities & Element Helpers** | ✅ Done |
| **Comprehensive Documentation** | ✅ Done |
| **HTML Test Reports with Traces** | ✅ Done |
| **API Testing to Verify DMS Data** | ⏸️ On Hold |

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
9. [Non-Functional Testing](#non-functional-testing)
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
   
   # No Access Account (for No Access Page testing)
   TEST_NO_ACCESS_EMAIL=no-access-account@example.com
   TEST_NO_ACCESS_PASSWORD=YourNoAccessPassword!
   
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
     ],
     "noAccessAccount": {
       "email": "TEST_NO_ACCESS_EMAIL",
       "password": "TEST_NO_ACCESS_PASSWORD",
       "description": "Test account that has no access to the Compliance Hub"
     }
   }
   ```

5. **Run authentication setup:**
   
   Create authentication session files (required before first test run):
   
   ```bash
   npx playwright test --project=setup
   ```
   
   This creates authentication files in `playwright/auth-states/user-*.json`.

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
| `TEST_NO_ACCESS_EMAIL` | No-access account email | `noaccess@example.com` | ✅ Yes (for No Access Page tests) |
| `TEST_NO_ACCESS_PASSWORD` | No-access account password | `NoAccessPass123!` | ✅ Yes (for No Access Page tests) |
| `BASE_URL` | Application base URL | `https://app.example.com` | ✅ Yes |
| `RUN_SETUP_AUTOMATICALLY` | Auto-run setup before tests | `1` (auto-run) or `0`/unset (manual) | 🔧 Optional |

**About `RUN_SETUP_AUTOMATICALLY` (Optional - Local Development):**
- **Default (unset or `0`)**: Setup must be run manually with `npx playwright test --project=setup`
- **When set to `1`**: Setup runs automatically before tests (convenient for local development)
- Default behavior matches CI/CD pattern where setup runs in a separate job
- Local developers can choose automatic setup for convenience or manual for faster iterations

### CI/CD Setup

For configuring the framework in GitHub Actions and other CI/CD pipelines, see:

📄 **[CI/CD Configuration Guide](Documentation/CI-CD.md)**

This guide covers:
- Setting up GitHub Actions secrets
- Configuring encrypted passwords in CI
- Pipeline configuration and workflows

## Running Tests

**First Time / When Authentication Expires:**

By default, setup must be run separately (matching CI/CD pattern):

```bash
# Create/refresh authentication files (stored in playwright/auth-states/user-*.json)
npx playwright test --project=setup
```

**Regular Test Execution:**

```bash
# Run all tests (setup must be run first unless RUN_SETUP_AUTOMATICALLY=1)
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run tests with trace enabled (for debugging)
npx playwright test --trace on

# Run specific project
npx playwright test --project=functional
npx playwright test --project=non-functional

# Run specific test by name
npx playwright test -g "test name"

# Run test in UI mode (interactive debugging)
npx playwright test --ui

# View test report
npx playwright show-report

# Run functional test with provided text in the test name in UI mode
npx playwright test -g "details 01" --project=functional --ui
```

**Optional - Auto-run Setup:**

For convenience during local development, you can enable automatic setup:

```bash
# Add to .env file:
RUN_SETUP_AUTOMATICALLY=1

# Now tests will run setup automatically if auth files are missing/expired
npx playwright test
```

**Notes:**
- Authentication files are valid for ~30 minutes of inactivity
- By default, you must run setup manually: `npx playwright test --project=setup`
- Set `RUN_SETUP_AUTOMATICALLY=1` in `.env` for automatic setup (optional convenience feature)

## Test Reports

The framework generates multiple types of reports to track test execution and coverage:

### Playwright HTML Report

Standard Playwright test execution report with detailed test results:

```bash
# View the HTML report after test run
npx playwright show-report
```

The report shows:
- Test execution status (passed/failed/skipped)
- Execution time and performance metrics
- Test annotations (test type, page name, etc.)
- Screenshots and traces for failed tests

### Non-Functional Test Coverage Report

Auto-generated report showing which non-functional tests have been performed on each page:

**Location:** `test-results/non-functional-test-coverage.md` (and `.html`)

**Generated:** After every test run

**Contains:**
- Summary table of pages tested
- Test types performed (Accessibility, Context Verification, etc.)
- Test results and violation counts
- Detailed results for each page

This report is auto-generated and should not be committed to the repository (see `.gitignore`).

### Test Annotations

All tests include annotations for better organization and reporting:

```typescript
test.describe('Your Test Suite', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push({ type: 'test-type', description: 'Accessibility' });
  });

  test('Your Test', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'page', description: 'Login Page' });
    // Test code...
  });
});
```

**Standard annotation types:**
- `test-type`: Category (e.g., 'Accessibility', 'Functional', 'Performance')
- `page`: Page being tested (e.g., 'Login Page', 'Dashboard')
- `feature`: Feature/module being tested (optional)

Annotations are visible in Playwright's HTML report and used to generate the non-functional test coverage report.

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
├── package.json                  # Node.js dependencies and scripts
├── README.md                     # This file
├── Documentation/               # Framework documentation
│   ├── Accessibility.md         # WCAG 2.2 AA testing guide
│   ├── Authentication.md        # Authentication setup guide
│   ├── CI-CD.md                 # CI/CD pipeline configuration
│   └── ContextVerification.md   # Context & structure validation guide
└── tests/
    ├── config/                   # Test configuration files
    ├── fixtures/                 # Custom test fixtures and shared context
    ├── pages/                    # Page Object Models
    │   ├── Compliance/          # Compliance Hub page objects
    │   └── Login/               # Authentication and login page objects
    │       └── BasePages/       # Base classes for login pages
    ├── test/
    │   ├── functional/          # End-to-end functional tests
    │   ├── non-functional/      # Accessibility, performance, and validation tests
    │   │   └── *-snapshots/     # Visual regression test snapshots
    │   └── setup/               # Authentication setup and configuration
    └── utils/                   # Test utilities and helper functions
```

**Note:** The following directories and files are generated at runtime and are excluded from version control:
- `node_modules/` - Package dependencies
- `playwright/auth-states/` - Stored authentication sessions
- `playwright-report/` - Generated test reports
- `test-results/` - Test execution results and coverage reports
- `.env` - Environment variables (contains sensitive credentials)
- `CopilotHelper/` - AI assistant project documentation

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

## Non-Functional Testing

The framework includes comprehensive non-functional testing covering multiple validation types to ensure pages are accessible, structurally correct, and visually consistent.

**Quick Start:**
```bash
npx playwright test --project=non-functional
```

**Test Types:**
- **Accessibility:** WCAG 2.2 AA compliance using axe-core
- **Context Verification:** DOM structure, content validation, visual regression

📄 **For comprehensive testing guides:**
- **[Accessibility Testing Documentation](Documentation/Accessibility.md)** - WCAG 2.2 AA criteria coverage
- **[Context Verification Documentation](Documentation/ContextVerification.md)** - DOM structure and content validation

### Custom Non-Functional Test Coverage Report

The framework automatically generates a detailed coverage report showing which non-functional tests have been performed on each page:

**Location:** `test-results/non-functional-test-coverage.md` (and `.html`)

**Generated:** After every non-functional test run

**Contains:**
- Summary table of pages tested
- Test types performed (Accessibility, Context Verification, etc.)
- Test execution status
- Detailed results for each page

**Coverage includes:** Accessibility compliance, DOM structure validation, URL patterns, content verification, and visual regression testing. See documentation links above for detailed implementation guides.

## Troubleshooting

### Authentication Issues

**Authentication fails or session expired:**
- Run `npx playwright test --project=setup` to refresh authentication state
- Verify environment variables are set correctly in `.env` file
- Check if `playwright/auth-states/user-*.json` files exist

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