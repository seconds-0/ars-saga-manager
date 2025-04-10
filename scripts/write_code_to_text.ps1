param(
    [switch]$commit = $false,
    [switch]$includeDocs = $false,
    [string]$outputFile = "codebase_documentation.txt",
    [switch]$noTimestamp = $false,
    [int]$timeout = 120,
    [switch]$skipLargeFiles = $false,
    [int]$maxFileSize = 1048576 # Default 1MB
)

Write-Host "Installing required dependencies..." -ForegroundColor Green
pip install pathspec

Write-Host "Running codebase to text converter..." -ForegroundColor Green

# Build command line arguments
$argList = @()
if ($commit) {
    $argList += "--commit"
    Write-Host "Will stage text file for commit" -ForegroundColor Yellow
}
if ($includeDocs) {
    $argList += "--include-docs"
    Write-Host "Will include documentation files even if in .gitignore" -ForegroundColor Yellow
}
if ($outputFile -ne "codebase_documentation.txt") {
    $argList += "--output-file"
    $argList += "$outputFile"
    Write-Host "Will save to $outputFile" -ForegroundColor Yellow
}
if ($noTimestamp) {
    $argList += "--no-timestamp"
    Write-Host "Will not add timestamp to output filename" -ForegroundColor Yellow
}
if ($timeout -ne 120) {
    $argList += "--timeout"
    $argList += "$timeout"
    Write-Host "Using timeout of $timeout seconds" -ForegroundColor Yellow
}
if ($skipLargeFiles) {
    $argList += "--skip-large-files"
    Write-Host "Will skip large files (> $($maxFileSize/1MB) MB)" -ForegroundColor Yellow
}
if ($skipLargeFiles -and $maxFileSize -ne 1048576) {
    $argList += "--max-file-size"
    $argList += "$maxFileSize"
    Write-Host "Max file size set to $($maxFileSize/1KB) KB" -ForegroundColor Yellow
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