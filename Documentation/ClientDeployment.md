 # Client Deployment Guide

## Deployment Approach: Dual Repository Sync

**Chosen Solution**: Client's repository is primary, with automated sync to personal repository after test completion.

## How It Works

- **Client's repository**: Primary source of truth for automation tests
- **Personal repository**: Receives automatic updates when tests complete (regardless of results)
- **Conditional execution**: Workflow only runs in client repository using PERSONAL_REPO_TOKEN detection

## Setup

1. **Repository imported**: Client imported automation repository
2. **Personal Access Token**: Create PAT with `repo` scope in personal GitHub
3. **Client repository secret**: Add `PERSONAL_REPO_TOKEN` secret to client repository
4. **Local configuration**:
   ```bash
   git remote set-url origin https://github.com/client-org/mees-test-automation.git
   git remote add personal https://github.com/Mikos24/MEES-Test-Automation.git
   ```
5. **Conditional workflow**: Same workflow file exists in both repositories but only executes where PERSONAL_REPO_TOKEN exists

## Development Workflow

- Work normally: `git push origin main` (goes to client repository)
- Client's workflow runs tests and syncs to personal repository afterward
- Personal repository workflow remains dormant (skipped due to missing PERSONAL_REPO_TOKEN)
- No manual sync or coordination required