
# Git Workflow Scripts

This directory contains utility scripts to help manage Git workflows safely in Replit.

## Available Scripts

### 1. git-sync-reset.sh
```bash
./scripts/git-sync-reset.sh
```
- Creates backup of current workspace
- Resets all local changes
- Pulls latest from origin/main
- Use when: You need to start fresh and pull all remote changes

### 2. git-pull-only.sh
```bash
./scripts/git-pull-only.sh
```
- Safely pulls latest changes without resetting local work
- Keeps your changes unless there's a direct conflict
- Use when: You want to update from GitHub while preserving local edits

### 3. git-status-summary.sh
```bash
./scripts/git-status-summary.sh
```
- Shows current branch
- Displays Git status
- Lists last 3 commits
- Use when: You need a quick overview of your Git state

### 4. git-force-push.sh
```bash
./scripts/git-force-push.sh
```
- ⚠️ USE WITH EXTREME CAUTION
- Forces push of local state to remote
- Only use when absolutely certain local is correct
- Use when: You need to overwrite remote (rare case)

## 🔒 Safety Guidelines

1. Always commit your changes before running any sync scripts
2. Use git-sync-reset.sh if you're unsure about your local state
3. Create regular backups before major operations
4. Never force push unless absolutely necessary
5. Keep sensitive data out of Git:
   - .env files
   - dist/ directory
   - node_modules/
   - Any API keys or secrets

## 📋 Recommended Workflow

1. Start work session:
   ```bash
   ./scripts/git-pull-only.sh
   ```

2. If you hit conflicts:
   ```bash
   ./scripts/git-sync-reset.sh
   ```

3. Before major changes:
   ```bash
   ./scripts/git-status-summary.sh
   ```

## ⚠️ Force Push Protocol

Only use force push if ALL these conditions are met:
1. You have a backup
2. You're certain local changes are correct
3. You've communicated with team members
4. You understand the consequences
