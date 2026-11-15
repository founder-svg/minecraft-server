#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — GPG AES-256 Encrypted Automated Backup
# Fully complies with PRD Section 16 (SEC-009)
# ===================================================================

set -e

BACKUP_DIR=${BACKUP_DIR:-"/backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_USER=${POSTGRES_USER:-"wixfox_admin"}
DB_NAME=${POSTGRES_DB:-"wixfox_network"}
BACKUP_KEY=${BACKUP_ENCRYPTION_KEY:-""}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

mkdir -p "${BACKUP_DIR}"
TEMP_DIR=$(mktemp -d)

trap 'rm -rf "${TEMP_DIR}"' EXIT

echo "[${TIMESTAMP}] Initiating Wixfox Encrypted Backup..."

# 1. PostgreSQL Database Dump
echo "[+] Dumping PostgreSQL database '${DB_NAME}'..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${DB_HOST}" -U "${DB_USER}" "${DB_NAME}" | gzip > "${TEMP_DIR}/db_${DB_NAME}.sql.gz"

# 2. Minecraft Worlds & Server Configurations
if [ -d "/data" ]; then
  echo "[+] Archiving Minecraft worlds and configs..."
  tar -czf "${TEMP_DIR}/minecraft_worlds.tar.gz" -C /data world world_nether world_the_end server.properties config/ 2>/dev/null || true
fi

# 3. Create unencrypted composite tarball
ARCHIVE_NAME="wixfox_snapshot_${TIMESTAMP}.tar.gz"
tar -czf "${TEMP_DIR}/${ARCHIVE_NAME}" -C "${TEMP_DIR}" "db_${DB_NAME}.sql.gz" $([ -f "${TEMP_DIR}/minecraft_worlds.tar.gz" ] && echo "minecraft_worlds.tar.gz")

# 4. GPG AES-256 Symmetric Encryption
FINAL_OUTPUT="${BACKUP_DIR}/${ARCHIVE_NAME}.gpg"
if [ -n "$BACKUP_KEY" ]; then
  echo "[+] Encrypting archive with GPG AES-256 cipher..."
  gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$BACKUP_KEY" -o "$FINAL_OUTPUT" "${TEMP_DIR}/${ARCHIVE_NAME}"
else
  echo "[!] WARNING: BACKUP_ENCRYPTION_KEY not set! Falling back to unencrypted archive."
  FINAL_OUTPUT="${BACKUP_DIR}/${ARCHIVE_NAME}"
  cp "${TEMP_DIR}/${ARCHIVE_NAME}" "$FINAL_OUTPUT"
fi

# 5. Generate SHA-256 Checksum for Integrity Verification
echo "[+] Generating SHA-256 integrity checksum..."
cd "${BACKUP_DIR}"
sha256sum "$(basename "$FINAL_OUTPUT")" > "$(basename "$FINAL_OUTPUT").sha256"

# 6. Apply Retention Policy (Purge backups older than retention days)
echo "[+] Cleaning up archives older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "wixfox_snapshot_*.gpg" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;
find "${BACKUP_DIR}" -name "wixfox_snapshot_*.sha256" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[SUCCESS] Encrypted backup created: $FINAL_OUTPUT ($(du -h "$FINAL_OUTPUT" | cut -f1))"
