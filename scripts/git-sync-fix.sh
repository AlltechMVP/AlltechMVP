
#!/bin/bash

# Fix common Git sync issues with GitHub in Replit

# Remove stale lock files
rm -f .git/index.lock .git/refs/remotes/origin/main.lock .git/config.lock

# Reset any broken or half-written commits
git reset --soft HEAD

# Force push Replit version to GitHub (use only if you're confident)
git push -u origin main --force

echo "✅ Git lock cleared and force push sent to origin/main."
