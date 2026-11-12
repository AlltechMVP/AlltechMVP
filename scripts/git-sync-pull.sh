
#!/bin/bash

echo "⚠️  This will fetch and pull changes from GitHub. Continue? (y/n)"
read answer
if [ "$answer" != "${answer#[Yy]}" ]; then
  echo "📥 Fetching latest changes..."
  git fetch origin

  echo "🔄 Pulling changes from origin/main..."
  git pull origin main

  echo "✅ Sync complete! Your local repository is now up to date."
else
  echo "❌ Aborted by user."
fi
