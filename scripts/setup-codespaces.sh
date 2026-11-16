#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network — GitHub Codespaces Setup Script
# Configures 4-Core 16GB Environment, Playit Tunnel, and Docker
# ===================================================================

set -e

echo "🦊 ========================================================="
echo "🦊  Setting up Wixfox Minecraft Network on GitHub Cloud"
echo "🦊 ========================================================="

# 1. Download Playit.gg Cloud Tunnel Agent
echo "🌐 Installing Playit.gg Cloud Tunnel Agent..."
if ! command -v playit &> /dev/null; then
  sudo curl -fsSL "https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64" -o /usr/local/bin/playit
  sudo chmod +x /usr/local/bin/playit
  echo "✅ Playit agent installed successfully."
fi

# 2. Ensure environment secrets exist
if [ ! -f .env ]; then
  echo "🔐 Generating cryptographic production secrets (.env)..."
  POSTGRES_PASS=$(openssl rand -hex 24)
  RCON_PASS=$(openssl rand -hex 20)
  JWT_SECRET=$(openssl rand -hex 32)
  BACKUP_PASSPHRASE=$(openssl rand -hex 24)

  cat <<EOF > .env
ENVIRONMENT=production
TZ=Asia/Kolkata

# Database Configuration (Runs locally inside GitHub Codespace)
POSTGRES_DB=wixfox_network
POSTGRES_USER=wixfox_admin
POSTGRES_PASSWORD=${POSTGRES_PASS}

# Minecraft Engine (Allocated for 4-Core 16GB RAM)
MINECRAFT_RAM_MIN=6G
MINECRAFT_RAM_MAX=10G
JAVA_PORT=25565
BEDROCK_PORT=19132
RCON_PASSWORD=${RCON_PASS}

# Security & API
JWT_SECRET=${JWT_SECRET}
BACKUP_PASSPHRASE=${BACKUP_PASSPHRASE}
ADMIN_PORT=8080
API_PORT=3000
EOF
  echo "✅ .env generated."
fi

echo "✅ GitHub Codespaces setup complete!"
