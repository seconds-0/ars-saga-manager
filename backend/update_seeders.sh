#!/bin/bash

# Script to update seeder files
# 1. Replace createdAt/updatedAt with created_at/updated_at
# 2. Replace null prerequisites, incompatibilities, and effects with empty JSON objects or arrays

SEEDERS_DIR="/mnt/c/Users/alexa/Coding Projects/ars-saga-manager/backend/seeders"
BACKUP_DIR="${SEEDERS_DIR}/backup_$(date +%Y%m%d%H%M%S)"
LOG_FILE="/tmp/seeder_update_$(date +%Y%m%d%H%M%S).log"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR" | tee -a "$LOG_FILE"

# Process each seeder file
for file in "$SEEDERS_DIR"/*.js; do
    filename=$(basename "$file")
    
    # Skip the backup directory if it's somehow included
    if [[ "$file" == *"/backup_"* ]]; then
        continue
    fi
    
    # Create backup
    cp "$file" "$BACKUP_DIR/$filename"
    
    echo "Processing: $filename" | tee -a "$LOG_FILE"
    
    # Make the replacements
    # 1. createdAt/updatedAt to created_at/updated_at
    # 2. Replace null values for specific fields with empty JSON structures
    sed -i \
        -e 's/createdAt: new Date()/created_at: new Date()/g' \
        -e 's/updatedAt: new Date()/updated_at: new Date()/g' \
        -e 's/prerequisites: null/prerequisites: JSON.stringify({})/g' \
        -e 's/incompatibilities: null/incompatibilities: JSON.stringify([])/g' \
        -e 's/effects: null/effects: JSON.stringify({})/g' \
        "$file"
    
    echo "  ✓ Updated $filename" | tee -a "$LOG_FILE"
done

echo "" | tee -a "$LOG_FILE"
echo "All files processed successfully!" | tee -a "$LOG_FILE"
echo "Backups saved to: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"