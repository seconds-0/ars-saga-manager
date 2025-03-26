@echo off
setlocal

set ARGS=

if "%~1"=="-commit" (
    set ARGS=--commit
    echo Will stage text files for commit
)
if "%~2"=="-commit" (
    set ARGS=%ARGS% --commit
    echo Will stage text files for commit
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

echo Running codebase to text converter...
python "%~dp0write_code_to_text.py" %ARGS%

echo Done!
echo The text files have been generated in the docs directory

if not "%ARGS%"=="--commit" if not "%ARGS:~0,9%"=="--commit " (
    echo Note: To include text files in your commits, run this script with the -commit parameter
)
if not "%ARGS%"=="--include-docs" if not "%ARGS:~-13%"==" --include-docs" (
    echo Note: To include documentation files that are listed in .gitignore, run this script with the -include-docs parameter
)
echo Example: write_code_to_text.bat -commit -include-docs

pause
endlocal