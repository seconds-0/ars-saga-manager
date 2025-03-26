#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ars Saga Manager Docker Test Runner ===${NC}"

# Make sure the test results directory exists
mkdir -p "$(dirname "$0")/test-results"

# Parse arguments
ARGS=""
BUILD=0
CLEAN=0
FILE=""

for arg in "$@"; do
  if [ "$arg" == "--build" ]; then
    BUILD=1
  elif [ "$arg" == "--clean" ]; then
    CLEAN=1
  elif [[ "$arg" == --file=* ]]; then
    FILE="${arg#*=}"
    ARGS="$ARGS --file=${FILE}"
  else
    ARGS="$ARGS $arg"
  fi
done

# Build the containers if needed
if [ $BUILD -eq 1 ]; then
  echo -e "\n${BLUE}Building test containers${NC}"
  docker-compose -f "$(dirname "$0")/docker-compose.test.yml" build
fi

echo -e "\n${BLUE}Running tests in Docker${NC}"
echo "Arguments: $ARGS"

# Run the tests
docker-compose -f "$(dirname "$0")/docker-compose.test.yml" run --rm test $ARGS

# Check the exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
else
  echo -e "\n${RED}Some tests failed${NC}"
fi

# Clean up
if [ $CLEAN -eq 1 ]; then
  echo -e "\n${BLUE}Cleaning up containers${NC}"
  docker-compose -f "$(dirname "$0")/docker-compose.test.yml" down
fi

exit $EXIT_CODE