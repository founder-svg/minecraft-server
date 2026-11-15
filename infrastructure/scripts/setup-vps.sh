#!/bin/bash
# ===================================================================
# Wixfox Minecraft Network - Ubuntu VPS Provisioning Script
# ===================================================================

set -e

echo "Updating Ubuntu package index..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw htop git

# Install Docker
echo "Installing official Docker Engine..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Setup UFW Firewall
echo "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP Admin
sudo ufw allow 443/tcp      # HTTPS Admin
sudo ufw allow 25565/tcp    # Minecraft Java Edition
sudo ufw allow 19132/udp    # Minecraft Bedrock Edition (Geyser)
sudo ufw --force enable

echo "=========================================================="
echo " VPS Provisioning Complete! System ready for Wixfox deploy."
echo " Run: git clone https://github.com/founder-svg/minecraft-server.git"
echo "=========================================================="
