#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network - Disaster Recovery & Restore Script
# ===================================================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <timestamp_suffix>"
    echo "Example: ./restore.sh 20261116_000000"
    exit 1
fi

TIMESTAMP="$1"
BACKUP_DIR=${BACKUP_DIR:-"/backups"}
DB_BACKUP_FILE="${BACKUP_DIR}/db_wixfox_network_${TIMESTAMP}.sql.gz"
WORLD_BACKUP_FILE="${BACKUP_DIR}/worlds_${TIMESTAMP}.tar.gz"

echo "=========================================================="
echo " Starting Disaster Recovery from Snapshot: ${TIMESTAMP}"
echo "=========================================================="

if [ ! -f "${DB_BACKUP_FILE}" ]; then
    echo "Error: Database backup file ${DB_BACKUP_FILE} not found!"
    exit 1
fi

echo "Restoring PostgreSQL database..."
gunzip -c "${DB_BACKUP_FILE}" | PGPASSWORD="${POSTGRES_PASSWORD}" psql -h postgres -U wixfox_admin -d wixfox_network

if [ -f "${WORLD_BACKUP_FILE}" ]; then
    echo "Restoring Minecraft worlds..."
    tar -xzf "${WORLD_BACKUP_FILE}" -C /data
fi

echo "Disaster recovery restoration completed successfully!"
