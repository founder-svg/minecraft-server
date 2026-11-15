#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — Cryptographic Secrets Generator
# Generates high-entropy production secrets for .env
# ===================================================================

set -e

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  echo "[!] A .env file already exists. Creating a backup at ${ENV_FILE}.bak..."
  cp "$ENV_FILE" "${ENV_FILE}.bak"
fi

echo "[+] Generating cryptographically secure random credentials..."

PG_PASS=$(openssl rand -hex 24)
RCON_PASS=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 48)
BACKUP_KEY=$(openssl rand -hex 32)

cat <<EOF > "$ENV_FILE"
# ===================================================================
# Wixfox Minecraft Network — Production Environment Variables
# Auto-generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# DO NOT COMMIT THIS FILE TO GIT!
# ===================================================================

# Server Ports
JAVA_PORT=25565
BEDROCK_PORT=19132
ADMIN_PORT=8080

# Minecraft Java Heap Allocation
MINECRAFT_RAM_MIN=4G
MINECRAFT_RAM_MAX=5G

# PostgreSQL 16 Credentials (High Entropy)
POSTGRES_DB=wixfox_network
POSTGRES_USER=wixfox_admin
POSTGRES_PASSWORD=${PG_PASS}

# Minecraft RCON Password
RCON_PASSWORD=${RCON_PASS}

# Backend API Authentication
JWT_SECRET=${JWT_SECRET}

# GPG Backup Encryption Key (AES-256)
BACKUP_ENCRYPTION_KEY=${BACKUP_KEY}

# Admin CORS Allowlist
CORS_ORIGIN=http://127.0.0.1:8080,http://localhost:8080
EOF

chmod 600 "$ENV_FILE"

echo "[SUCCESS] Generated secure production configuration in $ENV_FILE (Permissions: 0600)."
echo "[*] Secrets summary: 48-char DB password, 48-char RCON password, 96-char JWT secret, 64-char GPG key."
