
#!/bin/bash

echo "⚠️  Backing up and resetting..."
bash ./scripts/git-sync-reset.sh || { echo "❌ Reset failed. Aborting."; exit 1; }

echo "🚀 Force pushing local version to origin/main..."
bash ./scripts/git-force-push.sh || { echo "❌ Force push failed."; exit 1; }

echo "✅ Sync and force push complete."
