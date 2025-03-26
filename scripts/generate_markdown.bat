@echo off
echo Installing required dependencies...
pip install pathspec

echo Running codebase to markdown converter...
python "%~dp0generate_codebase_markdown.py"

echo Done!
echo The markdown file has been generated at the root of the project: codebase_documentation.md
pause 