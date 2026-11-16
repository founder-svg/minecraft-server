#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network — 1-Click Launch on GitHub Codespaces
# Runs Paper 1.20.4, PostgreSQL, and Playit.gg Cloud Tunnel
# ===================================================================

set -e

echo "🦊 ========================================================="
echo "🦊  Starting Wixfox Minecraft Network on GitHub Cloud..."
echo "🦊 ========================================================="

# 1. Start Docker Daemon if not running
if ! docker info > /dev/null 2>&1; then
  echo "🐳 Starting Docker service..."
  sudo service docker start || true
  sleep 3
fi

# 2. Launch Docker Containers (Postgres, Paper 1.20.4, Geyser, Backend API)
echo "🚀 Booting PostgreSQL Database & Minecraft Crossplay Engine..."
docker compose up -d --build

echo "⏳ Waiting for Paper server and PostgreSQL to initialize..."
sleep 5

# 3. Launch Playit.gg Global Tunnel (Exposes TCP 25565 & UDP 19132 globally)
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
