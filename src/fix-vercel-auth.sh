#!/bin/bash

# Fix Vercel Authentication Issue
# This script helps you set the correct environment variables for NextAuth v5

echo "🔧 Fixing Vercel Authentication Configuration"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📝 You need to set the following environment variables in Vercel:"
echo ""

# Generate AUTH_SECRET
echo "1️⃣  AUTH_SECRET (Required)"
echo "   Generate a secure random secret:"
AUTH_SECRET=$(openssl rand -base64 32)
echo "   Generated: $AUTH_SECRET"
echo ""

# Get deployment URL
echo "2️⃣  AUTH_URL (Required)"
echo "   Enter your Vercel deployment URL (e.g., https://your-app.vercel.app)"
read -p "   URL: " AUTH_URL
echo ""

# Database URL
echo "3️⃣  DATABASE_URL (Should already be set)"
echo "   Make sure it includes ?sslmode=require at the end"
echo ""

# Confirmation
echo "=============================================="
echo "Ready to set these environment variables:"
echo ""
echo "AUTH_SECRET=$AUTH_SECRET"
echo "AUTH_URL=$AUTH_URL"
echo "NEXTAUTH_SECRET=$AUTH_SECRET (backward compatibility)"
echo "NEXTAUTH_URL=$AUTH_URL (backward compatibility)"
echo ""

read -p "Do you want to set these in Vercel now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting environment variables..."
    
    # Set AUTH_SECRET
    echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production
    
    # Set AUTH_URL
    echo "$AUTH_URL" | vercel env add AUTH_URL production
    
    # Set backward compatibility variables
    echo "$AUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
    echo "$AUTH_URL" | vercel env add NEXTAUTH_URL production
    
    echo ""
    echo "✅ Environment variables set successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > Environment Variables"
    echo "4. Verify the variables are set correctly"
    echo "5. Redeploy your application"
    echo ""
else
    echo ""
    echo "Manual Setup Instructions:"
    echo "=========================="
    echo ""
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > Environment Variables"
    echo "4. Add these variables:"
    echo ""
    echo "   AUTH_SECRET=$AUTH_SECRET"
    echo "   AUTH_URL=$AUTH_URL"
    echo "   NEXTAUTH_SECRET=$AUTH_SECRET"
    echo "   NEXTAUTH_URL=$AUTH_URL"
    echo ""
    echo "5. Redeploy your application"
    echo ""
fi

echo "📚 For more information, see FIX_VERCEL_AUTH.md"
