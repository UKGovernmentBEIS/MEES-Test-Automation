 # Client Deployment Guide

## Deployment Approach: Manual Dual Repository

**Chosen Solution**: Maintain both repositories manually with independent CI/CD pipelines.

## How It Works

- **Client's repository**: Primary development repository for client use
- **Personal repository**: Independent backup with same codebase
- **Manual sync**: Push changes to both repositories when ready
- **Independent CI/CD**: Both repositories can run tests independently

## Setup

1. **Repository imported**: Client imported automation repository
2. **Local configuration**:
   ```bash
   git remote set-url origin https://github.com/UKGovernmentBEIS/MEES-Test-Automation.git
   git remote add personal https://github.com/Mikos24/MEES-Test-Automation.git
   ```
3. **Independent workflows**: Both repositories have complete CI/CD pipelines
4. **Manual coordination**: Push to both repositories when changes are ready

## Development Workflow

### Daily Development Process

1. **Primary development**: Work locally as usual
   - Make changes, commits, and test locally
   - Ensure all tests pass before pushing

2. **Pre-push verification**:
   ```bash
   # Check current status
   git status
   
   # Verify remotes are configured
   git remote -v
   
   # Check what commits will be pushed to each remote
   git log origin/main..main --oneline  # commits for client repo
   git log personal/main..main --oneline # commits for personal repo
   ```

### Pushing Changes to Both Repositories

#### Option 1: Push to Both at Once
```bash
# Push to both repositories simultaneously
git push origin main && git push personal main
```

#### Option 2: Push Individually
```bash
# Push to client repository first
git push origin main

# Then push to personal repository
git push personal main
```

#### Option 3: Force Push (if needed)
```bash
# If repositories are out of sync, you may need force push
git push personal main --force-with-lease
```

