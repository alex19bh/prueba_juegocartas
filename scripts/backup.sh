#!/bin/bash

echo "=== El Virus Game Backup Script ==="

# Define directories and files
BASE_DIR="$(pwd)"
SERVER_DIR="$BASE_DIR/server"
BACKUP_DIR="$BASE_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Load DB_PATH from .env file if it exists
if [ -f "$BASE_DIR/.env" ]; then
    DB_PATH=$(grep DB_PATH "$BASE_DIR/.env" | cut -d '=' -f2)
else
    # Default DB path
    DB_PATH="$SERVER_DIR/data/database.sqlite"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
echo "Creating backup of database: $DB_PATH"
cp "$DB_PATH" "$BACKUP_DIR/database_${TIMESTAMP}.sqlite"

# Backup environment files
echo "Backing up environment configuration..."
if [ -f "$BASE_DIR/.env" ]; then
    cp "$BASE_DIR/.env" "$BACKUP_DIR/env_${TIMESTAMP}.bak"
fi

# Compress backup (optional)
echo "Compressing backup..."
tar -czf "$BACKUP_DIR/el-virus-backup-${TIMESTAMP}.tar.gz" "$BACKUP_DIR/database_${TIMESTAMP}.sqlite" "$BACKUP_DIR/env_${TIMESTAMP}.bak"

# Cleanup individual files
rm "$BACKUP_DIR/database_${TIMESTAMP}.sqlite" "$BACKUP_DIR/env_${TIMESTAMP}.bak"

echo "Backup completed: $BACKUP_DIR/el-virus-backup-${TIMESTAMP}.tar.gz"
echo "To restore, extract the archive and copy the files to their original locations."
