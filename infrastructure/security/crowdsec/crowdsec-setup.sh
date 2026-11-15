#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — CrowdSec Installation & Configuration
# Installs CrowdSec Security Engine & Linux Firewall Bouncer
# ===================================================================

set -e

echo "[Wixfox Security] Installing CrowdSec repository..."
curl -s https://packagecloud.io/install/repositories/crowdsecurity/crowdsec/script.deb.sh | sudo bash

echo "[Wixfox Security] Installing crowdsec engine and firewall bouncer..."
sudo apt-get update
sudo apt-get install -y crowdsec crowdsec-firewall-bouncer-iptables

echo "[Wixfox Security] Installing crowdsecurity/linux & nginx collections..."
sudo cscli collections install crowdsecurity/linux
sudo cscli collections install crowdsecurity/nginx

echo "[Wixfox Security] Restarting CrowdSec services..."
sudo systemctl restart crowdsec
sudo systemctl restart crowdsec-firewall-bouncer

echo "[Wixfox Security] Verifying CrowdSec status..."
sudo cscli metrics
sudo cscli decisions list

echo "[Wixfox Security] CrowdSec intrusion detection engine active!"
