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

- **Primary development**: Work locally as usual
- **Push to client**: `git push origin main` (goes to client repository)
- **Push to personal**: `git push personal main` (goes to personal repository)  
- **Convenience command**: `git push origin main && git push personal main` (push to both)
- **Independent testing**: Both repositories run their own CI/CD pipelines