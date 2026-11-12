
#!/bin/bash

# Step 1: Back up your workspace
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_dir="backup_$timestamp"
mkdir -p "$backup_dir"
cp -r * "$backup_dir"
echo "📁 Workspace backed up to $backup_dir"

# Step 2: Confirm intent to reset
read -p "⚠️ This will reset all local changes and pull from origin/main. Proceed? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "❌ Aborted by user."
  exit 1
fi

# Step 3: Clean and reset repo
echo "🧹 Cleaning and resetting local changes..."
git reset --hard HEAD
git clean -fd

# Step 4: Pull from origin
echo "🔄 Pulling latest changes from origin/main..."
git pull origin main

echo "✅ Git sync reset complete!"
