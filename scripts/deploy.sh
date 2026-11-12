
#!/bin/bash

COMMIT_MSG=${1:-"Quick update"}

# Step 1: Stage all changes
git add .

# Step 2: Commit
git commit -m "$COMMIT_MSG"

# Step 3: Push to GitHub
git push

# Step 4: Trigger Vercel deploy
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_kMsuYLrQY3hn9QumZCCBm0yv6ojm/QVrDRnvPF5

echo -e "\n✅ Changes pushed and deployment triggered!"
