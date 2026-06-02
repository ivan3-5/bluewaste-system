# BlueWaste Vercel Setup Script for Windows
# This script helps configure environment variables for Vercel deployment

Write-Host "======================================"
Write-Host "BlueWaste Vercel Configuration Setup"
Write-Host "======================================"
Write-Host ""

# Check if Vercel CLI is installed
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if ($null -eq $vercelCmd) {
    Write-Host "❌ Vercel CLI is not installed" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel"
    exit 1
}

Write-Host "✓ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Check authentication
Write-Host "Step 1: Authentication" -ForegroundColor Yellow
Write-Host "---------------------"
Write-Host "Checking Vercel authentication..."
try {
    vercel whoami | Out-Null
    Write-Host "✓ Already logged in" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in. Run: vercel login" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Project Selection" -ForegroundColor Yellow
Write-Host "------------------------"
Write-Host "Make sure to link your GitHub repository to Vercel"
Write-Host "Visit: https://vercel.com/new"

Write-Host ""
Write-Host "Step 3: Environment Variables" -ForegroundColor Yellow
Write-Host "-----------------------------"
Write-Host "Add the following environment variables in Vercel dashboard:" -ForegroundColor White
Write-Host ""
Write-Host "Production Variables:" -ForegroundColor Cyan
Write-Host "  DATABASE_URL" -ForegroundColor Gray
Write-Host "  DATABASE_URL_UNPOOLED" -ForegroundColor Gray
Write-Host "  JWT_SECRET" -ForegroundColor Gray
Write-Host "  CLOUDINARY_CLOUD_NAME" -ForegroundColor Gray
Write-Host "  CLOUDINARY_API_KEY" -ForegroundColor Gray
Write-Host "  CLOUDINARY_API_SECRET" -ForegroundColor Gray
Write-Host "  NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "How to add variables:" -ForegroundColor White
Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "2. Select your project (bluewaste-system)" -ForegroundColor Gray
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor Gray
Write-Host "4. Add each variable for Production and Preview" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Create .env file" -ForegroundColor Yellow
Write-Host "------------------------"

$DATABASE_URL = Read-Host "Enter your NeonDB connection string (with ?sslmode=require)"
$JWT_SECRET = Read-Host "Enter your JWT_SECRET"
$CLOUDINARY_CLOUD_NAME = Read-Host "Enter CLOUDINARY_CLOUD_NAME"
$CLOUDINARY_API_KEY = Read-Host "Enter CLOUDINARY_API_KEY"
$CLOUDINARY_API_SECRET = Read-Host "Enter CLOUDINARY_API_SECRET" -AsSecureString

# Create .env file content (convert secure string for display only)
$envContent = @"
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
NODE_ENV=development
"@

$envPath = Join-Path $PSScriptRoot ".env"
Set-Content -Path $envPath -Value $envContent
Write-Host "✓ .env file created at: $envPath" -ForegroundColor Green
Write-Host ""

# Test database connection
Write-Host "Step 5: Testing Database Connection" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "Testing Prisma connection..."

Push-Location "$PSScriptRoot/backend"
try {
    npm run generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
        Write-Host "Check your DATABASE_URL format and connectivity"
        Pop-Location
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "======================================"
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================================"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor Gray
Write-Host "2. Vercel will automatically deploy" -ForegroundColor Gray
Write-Host "3. Monitor deployment at: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "For troubleshooting, see VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
