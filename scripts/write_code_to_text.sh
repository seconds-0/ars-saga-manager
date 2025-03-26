#!/bin/bash
# Wrapper script for write_code_to_text.py

ARGS=""
TIMEOUT=120

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --commit)
      ARGS="$ARGS --commit"
      echo "Will stage text file for commit"
      shift
      ;;
    --include-docs)
      ARGS="$ARGS --include-docs"
      echo "Will include documentation files even if in .gitignore"
      shift
      ;;
    --output-file)
      ARGS="$ARGS --output-file $2"
      echo "Will write to output file: $2"
      shift 2
      ;;
    --timestamp)
      ARGS="$ARGS --timestamp"
      echo "Will add timestamp to output filename"
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      ARGS="$ARGS --timeout $2"
      echo "Using timeout of $TIMEOUT seconds"
      shift 2
      ;;
    --skip-large-files)
      ARGS="$ARGS --skip-large-files"
      echo "Will skip large files"
      shift
      ;;
    --max-file-size)
      ARGS="$ARGS --max-file-size $2"
      echo "Max file size set to $2 bytes"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--commit] [--include-docs] [--output-file FILENAME] [--timestamp] [--timeout SECONDS] [--skip-large-files] [--max-file-size BYTES]"
      exit 1
      ;;
  esac
done

# Install dependencies
echo "Installing required dependencies..."
pip install pathspec

# Run the Python script
echo "Running codebase to text converter..."
python "$(dirname "$0")/write_code_to_text.py" $ARGS

echo "Done!"
echo "The text files have been generated in the docs directory"

if [[ ! "$ARGS" =~ "--commit" ]]; then
  echo "Note: To include text files in your commits, run this script with the --commit flag"
fi

if [[ ! "$ARGS" =~ "--include-docs" ]]; then
  echo "Note: To include documentation files that are listed in .gitignore, run this script with the --include-docs flag"
fi

echo "Example: ./write_code_to_text.sh --commit --include-docs --output-file codebase.txt --timestamp --timeout 300 --skip-large-files --max-file-size 2097152"