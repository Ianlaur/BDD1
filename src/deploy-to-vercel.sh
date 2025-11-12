#!/bin/bash

# Vercel Deployment Script
# This script helps prepare and push your code to the main branch for Vercel deployment

set -e  # Exit on error

echo "🚀 Preparing for Vercel Deployment"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the src directory?"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Prepare for Vercel deployment - $(date +%Y-%m-%d)"
    fi
    git commit -m "$COMMIT_MSG"
    echo "✅ Changes committed"
fi

# Push current branch
echo ""
echo "⬆️  Pushing $CURRENT_BRANCH to remote..."
git push origin "$CURRENT_BRANCH"
echo "✅ Pushed to $CURRENT_BRANCH"

# Ask if user wants to merge to main
echo ""
read -p "🔀 Merge $CURRENT_BRANCH to main and push? (y/n): " MERGE_CONFIRM

if [ "$MERGE_CONFIRM" = "y" ] || [ "$MERGE_CONFIRM" = "Y" ]; then
    echo ""
    echo "🔀 Switching to main branch..."
    git checkout main
    
    echo "📥 Pulling latest main..."
    git pull origin main || echo "⚠️  No remote main or first push"
    
    echo "🔀 Merging $CURRENT_BRANCH into main..."
    git merge "$CURRENT_BRANCH" -m "Merge $CURRENT_BRANCH for deployment"
    
    echo "⬆️  Pushing main to remote..."
    git push origin main
    
    echo ""
    echo "✅ Successfully pushed to main!"
    echo ""
    echo "🎉 Your code is now on the main branch!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to https://vercel.com/new"
    echo "2. Import repository: Ianlaur/BDD1"
    echo "3. Set Root Directory to: src"
    echo "4. Add environment variables (see .env.production.example)"
    echo "5. Deploy!"
    echo ""
    echo "📚 See DEPLOYMENT.md for detailed instructions"
    
    # Ask if user wants to switch back
    echo ""
    read -p "🔙 Switch back to $CURRENT_BRANCH? (y/n): " SWITCH_BACK
    if [ "$SWITCH_BACK" = "y" ] || [ "$SWITCH_BACK" = "Y" ]; then
        git checkout "$CURRENT_BRANCH"
        echo "✅ Switched back to $CURRENT_BRANCH"
    fi
else
    echo ""
    echo "ℹ️  Skipped merging to main"
    echo "💡 Run this script again when ready to deploy"
fi

echo ""
echo "✨ Done!"
