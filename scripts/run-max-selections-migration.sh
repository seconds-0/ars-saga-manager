#!/bin/bash

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Running max_selections Migration with Verification${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
  echo -e "${RED}Error: Run this script from the project root directory${NC}"
  exit 1
fi

# Check if the verification script exists
if [ ! -f "scripts/verify-max-selections-migration.js" ]; then
  echo -e "${RED}Error: verify-max-selections-migration.js not found${NC}"
  exit 1
fi

# Check if the migration file exists
if [ ! -f "backend/migrations/20250228000000-set-max-selections-for-virtues-flaws.js" ]; then
  echo -e "${RED}Error: Migration file not found!${NC}"
  exit 1
fi

# Step 1: Check pre-migration state
echo -e "\n${YELLOW}Step 1: Checking pre-migration state...${NC}"
node scripts/verify-max-selections-migration.js pre
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to check pre-migration state${NC}"
  exit 1
fi

# Step 2: Run the migration
echo -e "\n${YELLOW}Step 2: Running migration...${NC}"
cd backend
npx sequelize-cli db:migrate --name 20250228000000-set-max-selections-for-virtues-flaws.js
MIGRATION_RESULT=$?
cd ..

if [ $MIGRATION_RESULT -ne 0 ]; then
  echo -e "${RED}Error: Migration failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Migration completed successfully!${NC}"

# Step 3: Check post-migration state
echo -e "\n${YELLOW}Step 3: Checking post-migration state...${NC}"
node scripts/verify-max-selections-migration.js post
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to check post-migration state${NC}"
  exit 1
fi

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}  Migration Process Completed Successfully!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "${BLUE}Note: The frontend code has been updated to use the database values.${NC}"
echo -e "${BLUE}You can now restart your application to use the new database-driven approach.${NC}" 