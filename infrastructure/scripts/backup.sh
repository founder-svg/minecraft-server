#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network - Automated Backup Script
# Performs PostgreSQL Dump + Minecraft World Snapshot Archive
# ===================================================================

set -e

BACKUP_DIR=${BACKUP_DIR:-"/backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_USER=${POSTGRES_USER:-"wixfox_admin"}
DB_NAME=${POSTGRES_DB:-"wixfox_network"}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

mkdir -p "${BACKUP_DIR}"

echo "[${TIMESTAMP}] Starting Wixfox Automated Backup..."

# 1. PostgreSQL Database Backup
DB_BACKUP_FILE="${BACKUP_DIR}/db_${DB_NAME}_${TIMESTAMP}.sql.gz"
echo "Dumping database ${DB_NAME} to ${DB_BACKUP_FILE}..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${DB_HOST}" -U "${DB_USER}" "${DB_NAME}" | gzip > "${DB_BACKUP_FILE}"

# 2. Minecraft Worlds & Configs Backup
WORLD_BACKUP_FILE="${BACKUP_DIR}/worlds_${TIMESTAMP}.tar.gz"
if [ -d "/data/world" ]; then
    echo "Archiving Minecraft world data to ${WORLD_BACKUP_FILE}..."
    tar -czf "${WORLD_BACKUP_FILE}" -C /data world world_nether world_the_end server.properties config/
fi

# 3. Clean up backups older than retention period
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date +"%Y%m%d_%H%M%S")] Backup completed successfully!"
