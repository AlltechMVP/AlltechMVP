
#!/bin/bash

echo "📍 Branch: $(git branch --show-current)"
echo "🔍 Git Status:"
git status
echo ""
echo "📝 Recent Commits:"
git log --oneline -3
