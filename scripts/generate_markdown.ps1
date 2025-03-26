Write-Host "Installing required dependencies..." -ForegroundColor Green
pip install pathspec

Write-Host "Running codebase to markdown converter..." -ForegroundColor Green
python "$PSScriptRoot\generate_codebase_markdown.py"

Write-Host "Done!" -ForegroundColor Green
Write-Host "The markdown file has been generated at the root of the project: codebase_documentation.md" -ForegroundColor Cyan
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 