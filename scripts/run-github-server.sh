#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network — 1-Click Launch on GitHub Codespaces
# Runs Paper 1.20.4, PostgreSQL, and Playit.gg Cloud Tunnel
# ===================================================================

set -e

echo "🦊 ========================================================="
echo "🦊  Starting Wixfox Minecraft Network on GitHub Cloud..."
echo "🦊 ========================================================="

# 1. Ensure all mandatory environment secrets exist in .env
if [ ! -f .env ] || ! grep -q "BACKUP_ENCRYPTION_KEY" .env; then
  echo "🔐 Ensuring all required production secrets exist in .env..."
  POSTGRES_PASS=$(openssl rand -hex 24 2>/dev/null || echo "wixfox_pg_$(date +%s)")
  RCON_PASS=$(openssl rand -hex 20 2>/dev/null || echo "wixfox_rcon_$(date +%s)")
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "wixfox_jwt_$(date +%s)")
  BACKUP_KEY=$(openssl rand -hex 24 2>/dev/null || echo "wixfox_bkp_$(date +%s)")

  cat <<EOF > .env
ENVIRONMENT=production
TZ=Asia/Kolkata

# PostgreSQL Persistence
POSTGRES_DB=wixfox_network
POSTGRES_USER=wixfox_admin
POSTGRES_PASSWORD=${POSTGRES_PASS}

# Minecraft Engine (Paper 1.20.4 + Crossplay)
MINECRAFT_RAM_MIN=4G
MINECRAFT_RAM_MAX=8G
JAVA_PORT=25565
BEDROCK_PORT=19132
RCON_PASSWORD=${RCON_PASS}

# Security, JWT & Encrypted Backups
JWT_SECRET=${JWT_SECRET}
BACKUP_ENCRYPTION_KEY=${BACKUP_KEY}
BACKUP_PASSPHRASE=${BACKUP_KEY}
BACKUP_RETENTION_DAYS=7
ADMIN_PORT=8080
API_PORT=3000
EOF
  echo "✅ Cryptographic .env configured successfully."
fi

# 2. Start Docker Daemon if not running
if ! docker info > /dev/null 2>&1; then
  echo "🐳 Starting Docker service..."
  sudo service docker start || sudo dockerd &
  sleep 4
fi

# 3. Install Playit.gg agent if not present
if ! command -v playit &> /dev/null; then
  echo "🌐 Installing Playit.gg cloud tunnel agent..."
  sudo curl -fsSL "https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64" -o /usr/local/bin/playit
  sudo chmod +x /usr/local/bin/playit
  echo "✅ Playit agent installed."
fi

# 4. Launch Docker Containers (Postgres, Paper 1.20.4, Geyser, Backend API)
echo "🚀 Booting PostgreSQL Database & Minecraft Crossplay Engine..."
docker compose up -d --build

echo "⏳ Waiting for Paper server and PostgreSQL to initialize..."
sleep 5

# 5. Launch Playit.gg Global Tunnel (Exposes TCP 25565 & UDP 19132 globally)
echo ""
echo "🌐 ========================================================="
echo "🌐  LAUNCHING PLAYIT.GG GLOBAL CLOUD TUNNEL"
echo "🌐  Routes global player traffic to your GitHub Cloud Server"
echo "🌐 ========================================================="
echo ""
echo "👉 If this is your first run, click the Claim Link below to activate your free address."
echo "👉 Once claimed, share the generated address with your players!"
echo ""

# Run playit
playit
