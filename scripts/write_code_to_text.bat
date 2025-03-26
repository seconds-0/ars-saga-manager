@echo off
setlocal

set ARGS=
set TIMEOUT=120
set SKIP_LARGE=0
set MAX_FILE_SIZE=1048576

if "%~1"=="-commit" (
    set ARGS=--commit
    echo Will stage text files for commit
)
if "%~2"=="-commit" (
    set ARGS=%ARGS% --commit
    echo Will stage text files for commit
)
if "%~3"=="-commit" (
    set ARGS=%ARGS% --commit
    echo Will stage text files for commit
)
if "%~4"=="-commit" (
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
if "%~3"=="-include-docs" (
    set ARGS=%ARGS% --include-docs
    echo Will include documentation files even if in .gitignore
)
if "%~4"=="-include-docs" (
    set ARGS=%ARGS% --include-docs
    echo Will include documentation files even if in .gitignore
)

if "%~1"=="-timeout" (
    set TIMEOUT=%~2
    set ARGS=%ARGS% --timeout %TIMEOUT%
    echo Using timeout of %TIMEOUT% seconds
)
if "%~3"=="-timeout" (
    set TIMEOUT=%~4
    set ARGS=%ARGS% --timeout %TIMEOUT%
    echo Using timeout of %TIMEOUT% seconds
)

if "%~1"=="-skip-copy" (
    set ARGS=%ARGS% --skip-copy
    echo Will skip creating non-timestamped copy
)
if "%~2"=="-skip-copy" (
    set ARGS=%ARGS% --skip-copy
    echo Will skip creating non-timestamped copy
)
if "%~3"=="-skip-copy" (
    set ARGS=%ARGS% --skip-copy
    echo Will skip creating non-timestamped copy
)
if "%~4"=="-skip-copy" (
    set ARGS=%ARGS% --skip-copy
    echo Will skip creating non-timestamped copy
)

if "%~1"=="-skip-large-files" (
    set SKIP_LARGE=1
    set ARGS=%ARGS% --skip-large-files
    echo Will skip large files
)
if "%~2"=="-skip-large-files" (
    set SKIP_LARGE=1
    set ARGS=%ARGS% --skip-large-files
    echo Will skip large files
)
if "%~3"=="-skip-large-files" (
    set SKIP_LARGE=1
    set ARGS=%ARGS% --skip-large-files
    echo Will skip large files
)
if "%~4"=="-skip-large-files" (
    set SKIP_LARGE=1
    set ARGS=%ARGS% --skip-large-files
    echo Will skip large files
)

if "%~1"=="-max-file-size" (
    if %SKIP_LARGE%==1 (
        set MAX_FILE_SIZE=%~2
        set ARGS=%ARGS% --max-file-size %MAX_FILE_SIZE%
        echo Max file size set to %MAX_FILE_SIZE% bytes
    )
)
if "%~3"=="-max-file-size" (
    if %SKIP_LARGE%==1 (
        set MAX_FILE_SIZE=%~4
        set ARGS=%ARGS% --max-file-size %MAX_FILE_SIZE%
        echo Max file size set to %MAX_FILE_SIZE% bytes
    )
)

echo Installing required dependencies...
pip install pathspec

echo Running codebase to text converter...
echo Using timeout of %TIMEOUT% seconds
python "%~dp0write_code_to_text.py" %ARGS%

echo.
if errorlevel 1 (
    echo Failed to complete the operation. Try increasing the timeout or optimizing the script.
    echo Example: write_code_to_text.bat -timeout 300
    exit /b 1
)

echo.
echo The text files have been generated in the docs directory

if not "%ARGS%"=="--commit" if not "%ARGS:~0,9%"=="--commit " (
    echo Note: To include text files in your commits, run this script with the -commit parameter
)
if not "%ARGS%"=="--include-docs" if not "%ARGS:~-13%"==" --include-docs" (
    echo Note: To include documentation files that are listed in .gitignore, run this script with the -include-docs parameter
)
echo Example: write_code_to_text.bat -commit -include-docs -timeout 300 -skip-copy -skip-large-files -max-file-size 2097152

pause
endlocal