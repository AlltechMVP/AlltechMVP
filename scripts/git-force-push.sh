
#!/bin/bash

echo "🟡 Staging all changes..."
git add .

echo "🟠 Committing..."
git commit -m "Force push overwrite from local to origin/main"

echo "🔴 Force pushing..."
git push -f origin main

echo "✅ Force push complete."
