#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ars Saga Manager Docker Test Runner ===${NC}"
echo "Running in container with Node $(node -v)"

# Parse arguments
FRONTEND=0
BACKEND=0
FILE_PATTERN=""
TESTNAME_PATTERN=""

for arg in "$@"; do
  case $arg in
    --frontend)
      FRONTEND=1
      ;;
    --backend)
      BACKEND=1
      ;;
    --file=*)
      FILE_PATTERN="${arg#*=}"
      ;;
    --test=*)
      TESTNAME_PATTERN="${arg#*=}"
      ;;
    *)
      ;;
  esac
done

# Default to both if neither specified
if [ $FRONTEND -eq 0 ] && [ $BACKEND -eq 0 ]; then
  FRONTEND=1
  BACKEND=1
fi

# Build file patterns
FILE_ARGS=""
if [ ! -z "$FILE_PATTERN" ]; then
  FILE_ARGS="$FILE_PATTERN"
fi

# Build test name pattern
TEST_ARGS=""
if [ ! -z "$TESTNAME_PATTERN" ]; then
  TEST_ARGS="--testNamePattern=$TESTNAME_PATTERN"
fi

# Keep track of exit codes
FRONTEND_EXIT=0
BACKEND_EXIT=0

# Function to run tests
run_tests() {
  local area=$1
  local dir=$2
  
  echo -e "\n${BLUE}Running $area tests${NC}"
  echo -e "${BLUE}========================${NC}"
  
  cd $dir
  
  if [ ! -z "$FILE_ARGS" ]; then
    echo "Testing files matching: $FILE_ARGS"
  fi
  
  if [ ! -z "$TESTNAME_PATTERN" ]; then
    echo "Testing tests matching: $TESTNAME_PATTERN"
  fi
  
  # Run tests with Jest
  if [ "$area" == "frontend" ]; then
    echo "Running with Jest config: ./testing/jest.config.js"
    npx jest --config=./testing/jest.config.js $FILE_ARGS $TEST_ARGS --detectOpenHandles --forceExit
    return $?
  else
    echo "Running with default Jest config"
    npx jest $FILE_ARGS $TEST_ARGS --detectOpenHandles --forceExit
    return $?
  fi
}

# Run backend tests if requested
if [ $BACKEND -eq 1 ]; then
  run_tests "backend" "/usr/src/app/backend"
  BACKEND_EXIT=$?
  
  if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "\n${GREEN}Backend tests passed${NC}"
  else
    echo -e "\n${RED}Backend tests failed${NC}"
  fi
fi

# Run frontend tests if requested
if [ $FRONTEND -eq 1 ]; then
  run_tests "frontend" "/usr/src/app/frontend"
  FRONTEND_EXIT=$?
  
  if [ $FRONTEND_EXIT -eq 0 ]; then
    echo -e "\n${GREEN}Frontend tests passed${NC}"
  else
    echo -e "\n${RED}Frontend tests failed${NC}"
  fi
fi

# Summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
if [ $BACKEND -eq 1 ]; then
  if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "Backend: ${GREEN}PASSED${NC}"
  else
    echo -e "Backend: ${RED}FAILED${NC}"
  fi
fi

if [ $FRONTEND -eq 1 ]; then
  if [ $FRONTEND_EXIT -eq 0 ]; then
    echo -e "Frontend: ${GREEN}PASSED${NC}"
  else
    echo -e "Frontend: ${RED}FAILED${NC}"
  fi
fi

# Exit with appropriate code
if [ $BACKEND -eq 1 ] && [ $FRONTEND -eq 1 ]; then
  # If both were run, exit with error if either failed
  if [ $BACKEND_EXIT -ne 0 ] || [ $FRONTEND_EXIT -ne 0 ]; then
    exit 1
  fi
  exit 0
elif [ $BACKEND -eq 1 ]; then
  # If only backend was run, use its exit code
  exit $BACKEND_EXIT
elif [ $FRONTEND -eq 1 ]; then
  # If only frontend was run, use its exit code
  exit $FRONTEND_EXIT
else
  # This shouldn't happen, but just in case
  exit 0
fi