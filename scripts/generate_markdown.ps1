param(
    [switch]$commit = $false,
    [switch]$includeDocs = $false
)

Write-Host "Installing required dependencies..." -ForegroundColor Green
pip install pathspec

Write-Host "Running codebase to markdown converter..." -ForegroundColor Green

# Build command line arguments
$argList = @()
if ($commit) {
    $argList += "--commit"
    Write-Host "Will stage documentation files for commit" -ForegroundColor Yellow
}
if ($includeDocs) {
    $argList += "--include-docs"
    Write-Host "Will include documentation files even if in .gitignore" -ForegroundColor Yellow
}

# Run the Python script with appropriate arguments
python "$PSScriptRoot\generate_codebase_markdown.py" $argList

Write-Host "Done!" -ForegroundColor Green
Write-Host "Documentation files have been generated in the docs directory" -ForegroundColor Cyan

if (!$commit) {
    Write-Host "Note: To include documentation in your commits, run this script with the -commit flag" -ForegroundColor Yellow
}
if (!$includeDocs) {
    Write-Host "Note: To include documentation files that are listed in .gitignore, run this script with the -includeDocs flag" -ForegroundColor Yellow
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 