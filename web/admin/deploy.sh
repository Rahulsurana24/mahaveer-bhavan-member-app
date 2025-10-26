#!/bin/bash

# Deployment script for Sree Mahaveer Seva Admin Portal

echo "🚀 Starting deployment to Netlify..."
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if logged in
if ! netlify status &> /dev/null; then
    echo "⚠️  Not logged in to Netlify. Please login:"
    netlify login
fi

echo ""
echo "📦 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Deploying to Netlify..."

# Deploy to production
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your admin portal is now live!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  1. Test login functionality"
    echo "  2. Verify all pages load correctly"
    echo "  3. Check that environment variables are set"
    echo "  4. Test admin features with your account"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
