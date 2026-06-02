#!/bin/bash

# BlueWaste Prisma Vercel Setup Verification Script
# This script verifies that all Prisma Vercel fixes are properly applied

set -e

echo "======================================"
echo "BlueWaste Prisma Vercel Fixes Checker"
echo "======================================"
echo ""

FIXES_FOUND=0
FIXES_TOTAL=0

check_file() {
    local file=$1
    local pattern=$2
    local description=$3
    
    FIXES_TOTAL=$((FIXES_TOTAL + 1))
    
    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo "✓ $description"
            FIXES_FOUND=$((FIXES_FOUND + 1))
        else
            echo "❌ $description (pattern not found)"
        fi
    else
        echo "❌ $description (file not found: $file)"
    fi
}

check_file_exists() {
    local file=$1
    local description=$2
    
    FIXES_TOTAL=$((FIXES_TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo "✓ $description"
        FIXES_FOUND=$((FIXES_FOUND + 1))
    else
        echo "❌ $description (file not found: $file)"
    fi
}

echo "Checking Configuration Files..."
echo "------------------------------"
echo ""

# Check 1: Backend Prisma version
check_file "backend/package.json" '"@prisma/client": "\^6.16.0"' "Backend Prisma 6.16.0"

# Check 2: Backend build script
check_file "backend/package.json" '"build": "prisma generate && tsc"' "Backend build includes prisma generate"

# Check 3: Web Prisma version
check_file "web/package.json" '"@prisma/client": "\^6.16.0"' "Web Prisma 6.16.0"

# Check 4: Web build script
check_file "web/package.json" '"build": "prisma generate && next build"' "Web build includes prisma generate"

# Check 5: Web Prisma client improvements
check_file "web/src/lib/prisma.ts" "getPrismaClient" "Web Prisma client uses serverless-safe pattern"

# Check 6: Backend env validation
check_file "backend/src/config/env.ts" "validateDatabaseUrl" "Backend env validates database URL format"

# Check 7: Vercel config
check_file "vercel.json" '"env":' "Vercel config includes environment variables"

# Check 8: Next.js config
check_file "web/next.config.ts" "DATABASE_URL" "Next.js config handles DATABASE_URL"

# Check 9: Documentation files
check_file_exists "VERCEL_DEPLOYMENT.md" "VERCEL_DEPLOYMENT.md created"
check_file_exists "PRISMA_VERCEL_FIXES.md" "PRISMA_VERCEL_FIXES.md created"
check_file_exists "setup-vercel.sh" "setup-vercel.sh created"
check_file_exists "setup-vercel.ps1" "setup-vercel.ps1 created"

# Check 10: Environment files
check_file_exists "web/.env.example" "web/.env.example exists"
check_file_exists "backend/.env.example" "backend/.env.example exists"

echo ""
echo "======================================"
echo "Verification Results"
echo "======================================"
echo ""
echo "Fixes Applied: $FIXES_FOUND / $FIXES_TOTAL"
echo ""

if [ $FIXES_FOUND -eq $FIXES_TOTAL ]; then
    echo "✓ All fixes applied successfully!" -ForegroundColor Green
    echo ""
    echo "Next steps:"
    echo "1. Test locally: npm run backend:dev && npm run dev"
    echo "2. Review VERCEL_DEPLOYMENT.md"
    echo "3. Run setup-vercel.sh to configure Vercel"
    exit 0
else
    MISSING=$((FIXES_TOTAL - FIXES_FOUND))
    echo "❌ Missing $MISSING fixes"
    echo ""
    echo "Please check the errors above and re-run this verification"
    exit 1
fi
