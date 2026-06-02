#!/bin/bash

# BlueWaste Vercel Setup Script
# This script helps configure environment variables for Vercel deployment

set -e

echo "======================================"
echo "BlueWaste Vercel Configuration Setup"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "✓ Vercel CLI found"
echo ""

# Authenticate with Vercel
echo "Step 1: Authentication"
echo "---------------------"
echo "Make sure you're logged in to Vercel..."
vercel whoami || echo "⚠️  Not logged in. Run: vercel login"

echo ""
echo "Step 2: Project Selection"
echo "------------------------"
echo "Vercel will now help you link to your project..."
echo "Run: vercel link"

echo ""
echo "Step 3: Environment Variables"
echo "-----------------------------"
echo "Add the following environment variables in Vercel dashboard:"
echo ""
echo "Production Variables:"
echo "  DATABASE_URL"
echo "  DATABASE_URL_UNPOOLED"
echo "  JWT_SECRET"
echo "  CLOUDINARY_CLOUD_NAME"
echo "  CLOUDINARY_API_KEY"
echo "  CLOUDINARY_API_SECRET"
echo "  NODE_ENV=production"
echo ""
echo "How to add variables:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project (bluewaste-system)"
echo "3. Go to Settings → Environment Variables"
echo "4. Add each variable for Production and Preview"
echo ""

echo "Step 4: Create .env file"
echo "------------------------"
read -p "Enter your NeonDB connection string (with ?sslmode=require): " DATABASE_URL
read -p "Enter your JWT_SECRET: " JWT_SECRET
read -p "Enter CLOUDINARY_CLOUD_NAME: " CLOUDINARY_CLOUD_NAME
read -p "Enter CLOUDINARY_API_KEY: " CLOUDINARY_API_KEY
read -p "Enter CLOUDINARY_API_SECRET: " CLOUDINARY_API_SECRET

# Create .env file
cat > .env << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
NODE_ENV=development
EOF

echo "✓ .env file created"
echo ""

# Test database connection
echo "Step 5: Testing Database Connection"
echo "-----------------------------------"
echo "Testing Prisma connection..."
cd backend
npm run generate
cd ..

if [ $? -eq 0 ]; then
    echo "✓ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    echo "Check your DATABASE_URL"
    exit 1
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Vercel will automatically deploy"
echo "3. Monitor deployment at: https://vercel.com/dashboard"
echo ""
echo "For troubleshooting, see VERCEL_DEPLOYMENT.md"
