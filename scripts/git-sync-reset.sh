
#!/bin/bash

# Step 1: Create backup directory
backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Step 2: Copy everything except .git and backup dir itself
echo "📦 Backing up workspace to $backup_dir (excluding .git)..."
find . -mindepth 1 -maxdepth 1 \
  ! -name ".git" \
  ! -name "$backup_dir" \
  -exec cp -r {} "$backup_dir" \;

# Step 3: Confirm reset
read -p "⚠️ This will reset all local changes and pull from origin/main. Continue? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "❌ Aborted by user."
  exit 1
fi

# Step 4: Clean and reset
echo "🧹 Cleaning untracked files..."
git clean -fd
echo "♻️ Resetting local changes..."
git reset --hard

# Step 5: Pull from GitHub
echo "⬇️ Pulling latest from origin/main..."
git pull origin main

echo "✅ Git sync complete."
