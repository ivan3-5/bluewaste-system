# BlueWaste Prisma Vercel Setup Verification Script (PowerShell)
# This script verifies that all Prisma Vercel fixes are properly applied

Write-Host "======================================"
Write-Host "BlueWaste Prisma Vercel Fixes Checker"
Write-Host "======================================"
Write-Host ""

$fixesFound = 0
$fixesTotal = 0

function Check-File {
    param(
        [string]$File,
        [string]$Pattern,
        [string]$Description
    )
    
    global:$fixesTotal++
    
    if (Test-Path $File) {
        $content = Get-Content $File -Raw
        if ($content -match $Pattern) {
            Write-Host "✓ $Description" -ForegroundColor Green
            global:$fixesFound++
        } else {
            Write-Host "❌ $Description (pattern not found)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $Description (file not found: $File)" -ForegroundColor Red
    }
}

function Check-FileExists {
    param(
        [string]$File,
        [string]$Description
    )
    
    global:$fixesTotal++
    
    if (Test-Path $File) {
        Write-Host "✓ $Description" -ForegroundColor Green
        global:$fixesFound++
    } else {
        Write-Host "❌ $Description (file not found: $File)" -ForegroundColor Red
    }
}

Write-Host "Checking Configuration Files..."
Write-Host "------------------------------"
Write-Host ""

# Check 1: Backend Prisma version
Check-File "backend\package.json" '"@prisma/client":\s*"\^6\.16\.0"' "Backend Prisma 6.16.0"

# Check 2: Backend build script
Check-File "backend\package.json" '"build":\s*"prisma generate && tsc"' "Backend build includes prisma generate"

# Check 3: Web Prisma version
Check-File "web\package.json" '"@prisma/client":\s*"\^6\.16\.0"' "Web Prisma 6.16.0"

# Check 4: Web build script
Check-File "web\package.json" '"build":\s*"prisma generate && next build"' "Web build includes prisma generate"

# Check 5: Web Prisma client improvements
Check-File "web\src\lib\prisma.ts" "getPrismaClient" "Web Prisma client uses serverless-safe pattern"

# Check 6: Backend env validation
Check-File "backend\src\config\env.ts" "validateDatabaseUrl" "Backend env validates database URL format"

# Check 7: Vercel config
Check-File "vercel.json" '"env":\s*\{' "Vercel config includes environment variables"

# Check 8: Next.js config
Check-File "web\next.config.ts" "DATABASE_URL" "Next.js config handles DATABASE_URL"

# Check 9: Documentation files
Check-FileExists "VERCEL_DEPLOYMENT.md" "VERCEL_DEPLOYMENT.md created"
Check-FileExists "PRISMA_VERCEL_FIXES.md" "PRISMA_VERCEL_FIXES.md created"
Check-FileExists "setup-vercel.ps1" "setup-vercel.ps1 created"
Check-FileExists "verify-fixes.ps1" "verify-fixes.ps1 created"

# Check 10: Environment files
Check-FileExists "web\.env.example" "web\.env.example exists"
Check-FileExists "backend\.env.example" "backend\.env.example exists"

Write-Host ""
Write-Host "======================================"
Write-Host "Verification Results"
Write-Host "======================================"
Write-Host ""
Write-Host "Fixes Applied: $fixesFound / $fixesTotal"
Write-Host ""

if ($fixesFound -eq $fixesTotal) {
    Write-Host "✓ All fixes applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test locally: npm run backend:dev && npm run dev"
    Write-Host "2. Review VERCEL_DEPLOYMENT.md"
    Write-Host "3. Run setup-vercel.ps1 to configure Vercel"
} else {
    $missing = $fixesTotal - $fixesFound
    Write-Host "❌ Missing $missing fixes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the errors above and re-run this verification"
    exit 1
}
