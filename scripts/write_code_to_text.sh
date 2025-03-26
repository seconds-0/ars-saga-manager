#!/bin/bash
# Wrapper script for write_code_to_text.py

ARGS=""
TIMEOUT=120

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --commit)
      ARGS="$ARGS --commit"
      echo "Will stage text files for commit"
      shift
      ;;
    --include-docs)
      ARGS="$ARGS --include-docs"
      echo "Will include documentation files even if in .gitignore"
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      ARGS="$ARGS --timeout $2"
      echo "Using timeout of $TIMEOUT seconds"
      shift 2
      ;;
    --skip-copy)
      ARGS="$ARGS --skip-copy"
      echo "Will skip creating non-timestamped copy"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--commit] [--include-docs] [--timeout SECONDS] [--skip-copy]"
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

echo "Example: ./write_code_to_text.sh --commit --include-docs"