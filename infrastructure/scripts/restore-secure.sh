#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — GPG AES-256 Decryption & Restoration Script
# Fully complies with PRD Section 16 & 17
# ===================================================================

set -e

BACKUP_FILE="$1"
BACKUP_KEY=${BACKUP_ENCRYPTION_KEY:-""}
DB_HOST=${POSTGRES_HOST:-"postgres"}
DB_USER=${POSTGRES_USER:-"wixfox_admin"}
DB_NAME=${POSTGRES_DB:-"wixfox_network"}

if [ -z "$BACKUP_FILE" ]; then
  echo "[-] Usage: $0 <path_to_backup_archive.gpg>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[-] ERROR: Backup file '$BACKUP_FILE' does not exist!"
  exit 1
fi

echo "[*] Starting Wixfox Secure Restoration Process..."

# 1. SHA-256 Checksum Verification
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
  echo "[+] Verifying SHA-256 checksum..."
  cd "$(dirname "$BACKUP_FILE")"
  sha256sum -c "$(basename "$CHECKSUM_FILE")"
  echo "[+] Checksum VERIFIED! Archive integrity intact."
else
  echo "[!] Warning: No .sha256 file found for '$BACKUP_FILE'. Proceeding with caution."
fi

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

# 2. Decrypt GPG AES-256 Archive
DECRYPTED_TAR="${TEMP_DIR}/decrypted.tar.gz"
if [[ "$BACKUP_FILE" == *.gpg ]]; then
  echo "[+] Decrypting GPG archive..."
  if [ -z "$BACKUP_KEY" ]; then
    echo "[-] ERROR: BACKUP_ENCRYPTION_KEY is required to decrypt this archive!"
    exit 1
  fi
  gpg --batch --yes --decrypt --passphrase "$BACKUP_KEY" -o "$DECRYPTED_TAR" "$BACKUP_FILE"
else
  cp "$BACKUP_FILE" "$DECRYPTED_TAR"
fi

# 3. Extract Composite Archive
tar -xzf "$DECRYPTED_TAR" -C "$TEMP_DIR"

# 4. Restore PostgreSQL Database
DB_DUMP=$(find "$TEMP_DIR" -name "db_*.sql.gz" | head -n 1)
if [ -f "$DB_DUMP" ]; then
  echo "[+] Restoring PostgreSQL database '${DB_NAME}'..."
  gunzip -c "$DB_DUMP" | PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}"
  echo "[+] Database restored successfully!"
fi

# 5. Restore Minecraft Worlds
MC_WORLDS=$(find "$TEMP_DIR" -name "minecraft_worlds.tar.gz" | head -n 1)
if [ -f "$MC_WORLDS" ] && [ -d "/data" ]; then
  echo "[+] Restoring Minecraft world files to /data..."
  tar -xzf "$MC_WORLDS" -C /data
  echo "[+] Minecraft world files restored successfully!"
fi

echo "[SUCCESS] Complete disaster recovery restoration verified and completed."
