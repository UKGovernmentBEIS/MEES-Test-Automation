# MEES Test Automation Framework

**Purpose**: Automated testing framework for MEES (Minimum Energy Efficiency Standards) compliance application using Playwright.

## What It Includes

- **Functional Testing**: End-to-end user flows and business logic validation
- **Accessibility Testing**: WCAG 2.2 AA compliance using axe-core
- **API Testing**: Both user-level (Page API) and service-level (DMS API) boundary testing
- **Authentication**: GOV.UK One Login integration with stored session state
- **Parallel Execution**: Multiple test accounts for faster CI/CD execution
- **Page Object Model**: Maintainable test structure with reusable components
- **Browser Support**: Configured for Desktop Chrome only (can be extended for multi-browser testing)
- **CI/CD Integration**: GitHub Actions pipeline with automated reporting

## Local Setup

**Prerequisites**: Node.js 16+, 2+ GOV.UK One Login accounts with MFA enabled

1. **Install dependencies**:
   ```bash
   npm install
   npx playwright install
   ```
2. **Setup test accounts**
  Setup test accounts in the `tests/config/test-accounts.json` that will be used to access MEES application.
  
  The `accounts` are used to access application when executing functional or non-fucntional tests. 
  One account is used for one worker therefore make sure that number of workers and number of accounts match. Workers can be configured in the `playwright.config.ts` file, in the `defineConfig` section.

  The `noAccessAccount` just needs one account that is valid One Login account without access to MEES Compliance Hub page.

3. **Create `.env` file** with test credentials:
   ```env
   # Test Accounts (each needs separate GOV.UK One Login with MFA)
   TEST_ACCOUNT_1_EMAIL=user1@example.com
   TEST_ACCOUNT_1_PASSWORD=Password123!
   TEST_ACCOUNT_2_EMAIL=user2@example.com
   TEST_ACCOUNT_2_PASSWORD=Password456!
   
   # No access account for specific tests
   TEST_NO_ACCESS_EMAIL=noaccess@example.com
   TEST_NO_ACCESS_PASSWORD=NoAccess789!
   
   # Application URL
   BASE_URL=https://your-app-url.com
   
   # API key for DMS API tests
   PROPERTIES_KEY=your-api-key-here
   LOCAL_AUTHORITIES_KEY=your-la-key-here
   DMS_BASE_URL=url-to-dms-service
   ```

4. **Run authentication setup** (creates session files):
  Run authentication setup before each test to store authenticated session in cookies or configure automatic
  authentication setup execution before each test by enabling `RUN_SETUP_AUTOMATICALLY=1` config in the `.env` file.
  
   ```bash
   npx playwright test --project=setup
   ```
   
## Essential Commands

```bash
# Setup authentication (run first time and when sessions expire)
# For more information look at the 'Authentication Setup' section
npx playwright test --project=setup

# Run all tests
npx playwright test

# Run specific test types
npx playwright test --project=functional        # User flows
npx playwright test --project=non-functional    # Accessibility + validation  
npx playwright test --project=api              # API boundary tests

# Development & debugging
npx playwright test --ui                       # Interactive mode
npx playwright test --headed                   # See browser
npx playwright test -g "test name"            # Run specific test
npx playwright show-report                     # View test results
```

## Authentication Setup

**What it is**: Uses GOV.UK One Login authentication with stored browser sessions to avoid repeated logins.

**Why needed**: 
- **Speed**: Avoids 10+ seconds of login flow per test
- **Parallel execution**: Each worker uses separate authenticated session
- **Reliability**: Reduces authentication-related test failures

**How it works**:
1. Setup project logs into each test account and saves session cookies
2. Test workers load their assigned session file (user-0.json, user-1.json, etc.)
3. Tests run immediately without login flow
4. Sessions expire after ~30 minutes of inactivity

**Test account requirements**: Each account must be a complete GOV.UK One Login with MFA enabled and registered in the application.

## Reports

**Playwright HTML Report**: Detailed test execution results with traces and screenshots
```bash
npx playwright show-report  # Open after test run
```

**Coverage Report**: Auto-generated summary of accessibility and validation testing
- **Location**: `test-results/non-functional-test-coverage.md` (and `.html`)
- **Content**: Which pages tested, accessibility violations, test status
- **Generated**: After each non-functional test run

**CI/CD Reports**: GitHub Actions uploads test reports as downloadable artifacts with 30-day retention.

## CI/CD Pipeline Setup

**GitHub Actions**: Configured in `.github/workflows/playwright.yml`
- **Triggers**: Push, PR, manual dispatch
- **Jobs**: Setup → Functional tests + Non-functional tests (parallel)
- **Secrets needed**: Test account credentials, BASE_URL, API keys
- **Reports**: Downloadable artifacts with test results and coverage

📄 **See [CI-CD.md](Documentation/CI-CD.md) for complete pipeline configuration**

## Quick Troubleshooting

**Authentication issues**:
- Run `npx playwright test --project=setup` to refresh sessions
- Ensure test accounts have completed MFA setup in GOV.UK One Login
- Check `.env` file has correct credentials

**Test failures**:
- View detailed reports: `npx playwright show-report`
- Debug with traces: `npx playwright test --trace on`
- Use interactive mode: `npx playwright test --ui`

## Documentation

- **[Authentication.md](Documentation/Authentication.md)**: Detailed auth setup and troubleshooting
- **[Accessibility.md](Documentation/Accessibility.md)**: WCAG 2.2 AA testing guide
- **[CI-CD.md](Documentation/CI-CD.md)**: Pipeline configuration and secrets setup
- **[ContextVerification.md](Documentation/ContextVerification.md)**: DOM structure and content validation

## Project Structure

```
├── tests/
│   ├── pages/           # Page Object Models
│   ├── test/
│   │   ├── functional/  # End-to-end user flows
│   │   ├── non-functional/ # Accessibility + validation
│   │   ├── api/         # API boundary testing
│   │   └── setup/       # Authentication setup
│   └── utils/           # Test utilities
├── Documentation/       # Guides and setup instructions
└── playwright.config.ts # Test configuration
```