# Git Workflow Guide

This document describes the Git branching strategy for Plinqy.

## Branch Structure

- **main** - Production-ready code, stable releases
- **staging** - Integration branch for testing before merging to main
- **feature/** - Feature development branches (optional)

## Workflow

### 1. Daily Development (Work on Staging)

All development work should be done on the `staging` branch:

```bash
# Make sure you're on staging
git checkout staging

# Pull latest changes
git pull origin staging

# Make your changes
# ... edit files ...

# Stage and commit
git add .
git commit -m "feat: your feature description"

# Push to staging
git push origin staging
```

### 2. Release to Production (Merge Staging to Main)

When staging is stable and ready for production:

```bash
# Switch to main
git checkout main

# Pull latest main
git pull origin main

# Merge staging into main
git merge staging

# Push to main
git push origin main

# Switch back to staging for continued development
git checkout staging
```

### 3. Quick Commands Reference

```bash
# Check current branch
git branch

# View status
git status

# View commit history
git log --oneline

# View branches
git branch -a

# Discard local changes
git checkout -- .

# Pull latest from staging
git pull origin staging

# Push to staging
git push origin staging
```

## Commit Message Convention

Use clear, descriptive commit messages:

```
type: brief description

Examples:
- feat: Add user authentication
- fix: Resolve database connection timeout
- docs: Update README
- refactor: Simplify product search
- test: Add unit tests for store service
- chore: Update dependencies
```

### Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

## Current Setup

Both branches are now live on GitHub:
- Staging: https://github.com/al-mamun/plinqyinventory/tree/staging
- Main: https://github.com/al-mamun/plinqyinventory/tree/main

## Protected Branches (Recommended GitHub Settings)

Consider protecting the `main` branch on GitHub:

1. Go to repository Settings > Branches
2. Add branch protection rule for `main`
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Include administrators (optional)

This ensures all changes to main go through staging first.
