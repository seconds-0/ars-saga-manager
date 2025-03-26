param(
    [switch]$commit = $false,
    [switch]$includeDocs = $false,
    [int]$timeout = 120,
    [switch]$skipCopy = $false
)

Write-Host "Installing required dependencies..." -ForegroundColor Green
pip install pathspec

Write-Host "Running codebase to text converter..." -ForegroundColor Green

# Build command line arguments
$argList = @()
if ($commit) {
    $argList += "--commit"
    Write-Host "Will stage text files for commit" -ForegroundColor Yellow
}
if ($includeDocs) {
    $argList += "--include-docs"
    Write-Host "Will include documentation files even if in .gitignore" -ForegroundColor Yellow
}
if ($timeout -ne 120) {
    $argList += "--timeout"
    $argList += "$timeout"
    Write-Host "Using timeout of $timeout seconds" -ForegroundColor Yellow
}
if ($skipCopy) {
    $argList += "--skip-copy"
    Write-Host "Will skip creating non-timestamped copy" -ForegroundColor Yellow
}

# Run the Python script with appropriate arguments
Write-Host "Running with timeout of $timeout seconds" -ForegroundColor Cyan
python "$PSScriptRoot\write_code_to_text.py" $argList

Write-Host "Done!" -ForegroundColor Green
Write-Host "Text files have been generated in the docs directory" -ForegroundColor Cyan

if (!$commit) {
    Write-Host "Note: To include text files in your commits, run this script with the -commit flag" -ForegroundColor Yellow
}
if (!$includeDocs) {
    Write-Host "Note: To include documentation files that are listed in .gitignore, run this script with the -includeDocs flag" -ForegroundColor Yellow
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")