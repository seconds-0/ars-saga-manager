# PowerShell script to run the max_selections migration with verification

Write-Host "==================================================" -ForegroundColor Blue
Write-Host "  Running max_selections Migration with Verification" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Check if scripts directory exists
if (-not (Test-Path "scripts")) {
    Write-Host "Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if the verification script exists
if (-not (Test-Path "scripts/verify-max-selections-migration.js")) {
    Write-Host "Error: verify-max-selections-migration.js not found" -ForegroundColor Red
    exit 1
}

# Check if the migration file exists
if (-not (Test-Path "backend/migrations/20250228000000-set-max-selections-for-virtues-flaws.js")) {
    Write-Host "Error: Migration file not found!" -ForegroundColor Red
    exit 1
}

# Check if backend/.env exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "Error: backend/.env file not found! Database connection will fail." -ForegroundColor Red
    exit 1
}

# Step 1: Check pre-migration state
Write-Host "`nStep 1: Checking pre-migration state..." -ForegroundColor Yellow
node scripts/verify-max-selections-migration.js pre
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to check pre-migration state" -ForegroundColor Red
    exit 1
}

# Step 2: Run the migration
Write-Host "`nStep 2: Running migration..." -ForegroundColor Yellow
Push-Location backend
# Make sure to use the .env file in the current directory
$env:NODE_ENV = "development"
npx sequelize-cli db:migrate --name 20250228000000-set-max-selections-for-virtues-flaws.js
$migrationResult = $LASTEXITCODE
Pop-Location

if ($migrationResult -ne 0) {
    Write-Host "Error: Migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Migration completed successfully!" -ForegroundColor Green

# Step 3: Check post-migration state
Write-Host "`nStep 3: Checking post-migration state..." -ForegroundColor Yellow
node scripts/verify-max-selections-migration.js post
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to check post-migration state" -ForegroundColor Red
    exit 1
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  Migration Process Completed Successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Note: The frontend code has been updated to use the database values." -ForegroundColor Blue
Write-Host "You can now restart your application to use the new database-driven approach." -ForegroundColor Blue 