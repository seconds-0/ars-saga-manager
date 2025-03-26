@echo off
setlocal

set ARGS=

if "%~1"=="-commit" (
    set ARGS=--commit
    echo Will stage documentation files for commit
)
if "%~2"=="-commit" (
    set ARGS=%ARGS% --commit
    echo Will stage documentation files for commit
)

if "%~1"=="-include-docs" (
    set ARGS=%ARGS% --include-docs
    echo Will include documentation files even if in .gitignore
)
if "%~2"=="-include-docs" (
    set ARGS=%ARGS% --include-docs
    echo Will include documentation files even if in .gitignore
)

echo Installing required dependencies...
pip install pathspec

echo Running codebase to markdown converter...
python "%~dp0generate_codebase_markdown.py" %ARGS%

echo Done!
echo The documentation files have been generated in the docs directory

if not "%ARGS%"=="--commit" if not "%ARGS:~0,9%"=="--commit " (
    echo Note: To include documentation in your commits, run this script with the -commit parameter
)
if not "%ARGS%"=="--include-docs" if not "%ARGS:~-13%"==" --include-docs" (
    echo Note: To include documentation files that are listed in .gitignore, run this script with the -include-docs parameter
)
echo Example: generate_markdown.bat -commit -include-docs

pause
endlocal 