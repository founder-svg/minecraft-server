#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network — Automated Oracle Cloud VPS Deployment
# Target: Ubuntu 22.04 / 24.04 LTS (Ampere ARM64 or AMD64)
# ===================================================================

set -e

echo "🦊 ========================================================="
echo "🦊  Wixfox Minecraft Network — Automated VPS Deployment"
echo "🦊  Architecture: Java + Bedrock Crossplay (Paper + Geyser)"
echo "🦊 ========================================================="

# 1. Update system packages
echo "📦 [1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw iptables-persistent git openssl

# 2. Fix Oracle Cloud default iptables block (CRITICAL FOR ORACLE CLOUD)
echo "🛡️ [2/6] Configuring Oracle Cloud host iptables & firewall..."
# Oracle Ubuntu images drop incoming traffic on non-port 22 by default
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 25565 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p udp --dport 19132 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo netfilter-persistent save || true

# Also configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 25565/tcp
sudo ufw allow 19132/udp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Install Docker and Docker Compose
echo "🐳 [3/6] Installing Docker Engine & Docker Compose Plugin..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER || true

# 4. Clone or pull Wixfox Minecraft Server
echo "📥 [4/6] Fetching Wixfox Minecraft Server repository..."
TARGET_DIR="$HOME/minecraft-server"
if [ -d "$TARGET_DIR" ]; then
  cd "$TARGET_DIR"
  git pull origin main
else
  git clone https://github.com/founder-svg/minecraft-server.git "$TARGET_DIR"
  cd "$TARGET_DIR"
fi

# 5. Generate secure cryptographic environment file
echo "🔐 [5/6] Generating high-entropy production secrets (.env)..."
if [ ! -f .env ]; then
  POSTGRES_PASS=$(openssl rand -hex 24)
  RCON_PASS=$(openssl rand -hex 20)
  JWT_SECRET=$(openssl rand -hex 32)
  BACKUP_PASSPHRASE=$(openssl rand -hex 24)

  cat <<EOF > .env
# Wixfox Production Environment
ENVIRONMENT=production
TZ=Asia/Kolkata

# Database Configuration
POSTGRES_DB=wixfox_network
POSTGRES_USER=wixfox_admin
POSTGRES_PASSWORD=${POSTGRES_PASS}

# Minecraft Engine
MINECRAFT_RAM_MIN=4G
MINECRAFT_RAM_MAX=6G
JAVA_PORT=25565
BEDROCK_PORT=19132
RCON_PASSWORD=${RCON_PASS}

# Security & API
JWT_SECRET=${JWT_SECRET}
BACKUP_PASSPHRASE=${BACKUP_PASSPHRASE}
ADMIN_PORT=8080
API_PORT=3000
EOF
  echo "✅ Fresh secure .env created with cryptographically random secrets."
fi

# 6. Build and launch services
echo "🚀 [6/6] Launching Wixfox Minecraft Services via Docker Compose..."
sudo docker compose up -d --build

# Get Public IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_VPS_IP")

echo ""
echo "🎉 ========================================================="
echo "🎉  WIXFOX MINECRAFT SERVER DEPLOYED & RUNNING 24/7!"
echo "🎉 ========================================================="
echo ""
echo "🎮 Java Edition Players Connect to:"
echo "   Server Address: ${PUBLIC_IP}:25565"
echo ""
echo "📱 Bedrock Edition (Mobile/Console) Players Connect to:"
echo "   Server Address: ${PUBLIC_IP}"
echo "   Port:           19132"
echo ""
echo "🌐 Connect your domain (play.wixfox.net):"
echo "   Add an 'A' record pointing 'play.wixfox.net' -> ${PUBLIC_IP}"
echo ""
echo "📊 Web Admin Console:"
echo "   https://founder-svg.github.io/minecraft-server/"
echo "========================================================="
