#!/bin/bash
# Wrapper script for generate_codebase_markdown.py

ARGS=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --commit)
      ARGS="$ARGS --commit"
      echo "Will stage documentation files for commit"
      shift
      ;;
    --include-docs)
      ARGS="$ARGS --include-docs"
      echo "Will include documentation files even if in .gitignore"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--commit] [--include-docs]"
      exit 1
      ;;
  esac
done

# Install dependencies
echo "Installing required dependencies..."
pip install pathspec

# Run the Python script
echo "Running codebase to markdown converter..."
python "$(dirname "$0")/generate_codebase_markdown.py" $ARGS

echo "Done!"
echo "The documentation files have been generated in the docs directory"

if [[ ! "$ARGS" =~ "--commit" ]]; then
  echo "Note: To include documentation in your commits, run this script with the --commit flag"
fi

if [[ ! "$ARGS" =~ "--include-docs" ]]; then
  echo "Note: To include documentation files that are listed in .gitignore, run this script with the --include-docs flag"
fi

echo "Example: ./generate_markdown.sh --commit --include-docs"