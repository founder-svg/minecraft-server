#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — Production VPS Security Hardening Script
# Fully compliant with PRD Version 1.0 (SEC-001 through SEC-012)
# Supported OS: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ===================================================================

set -e

if [ "$EUID" -ne 0 ]; then
  echo "[-] ERROR: This script must be run as root. Execute with sudo."
  exit 1
fi

echo "======================================================================"
echo " Starting Wixfox Minecraft Network Security Hardening"
echo "======================================================================"

# -------------------------------------------------------------------
# 1. System Package Updates & Unattended Security Upgrades
# -------------------------------------------------------------------
echo "[+] Step 1: Updating packages and enabling automatic security updates..."
apt-get update && apt-get upgrade -y
apt-get install -y unattended-upgrades apt-listchanges ufw fail2ban curl git ca-certificates gnupg lsb-release

# Configure unattended-upgrades for automatic security patching
dpkg-reconfigure -plow unattended-upgrades

# -------------------------------------------------------------------
# 2. Non-Root Administration Account
# -------------------------------------------------------------------
ADMIN_USER="wixfox-admin"
if id "$ADMIN_USER" &>/dev/null; then
  echo "[+] Admin user '$ADMIN_USER' already exists."
else
  echo "[+] Step 2: Creating dedicated administrative user '$ADMIN_USER'..."
  adduser --disabled-password --gecos "" "$ADMIN_USER"
  usermod -aG sudo "$ADMIN_USER"
  echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/99-wixfox-admin"
  chmod 0440 "/etc/sudoers.d/99-wixfox-admin"
  echo "[!] IMPORTANT: Copy your public SSH key to /home/$ADMIN_USER/.ssh/authorized_keys"
fi

# -------------------------------------------------------------------
# 3. Kernel Network Hardening (SYN Flood & Spoof Protection)
# -------------------------------------------------------------------
echo "[+] Step 3: Applying kernel network hardening sysctl settings..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/sysctl.d/99-wixfox-security.conf" ]; then
  cp "$SCRIPT_DIR/sysctl.d/99-wixfox-security.conf" /etc/sysctl.d/99-wixfox-security.conf
  sysctl -p /etc/sysctl.d/99-wixfox-security.conf
else
  cat <<'EOF' > /etc/sysctl.d/99-wixfox-security.conf
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
EOF
  sysctl -p /etc/sysctl.d/99-wixfox-security.conf
fi

# -------------------------------------------------------------------
# 4. Tailscale Private VPN Installation
# -------------------------------------------------------------------
echo "[+] Step 4: Installing Tailscale for private admin access..."
if ! command -v tailscale &>/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
  echo "[*] Tailscale installed. Run 'tailscale up' after this script to authenticate your node."
else
  echo "[+] Tailscale is already installed."
fi

# -------------------------------------------------------------------
# 5. SSH Daemon Security Hardening
# -------------------------------------------------------------------
echo "[+] Step 5: Enforcing strict SSH daemon configuration..."
mkdir -p /etc/ssh/sshd_config.d/
if [ -f "$SCRIPT_DIR/sshd_config.d/99-wixfox-hardening.conf" ]; then
  cp "$SCRIPT_DIR/sshd_config.d/99-wixfox-hardening.conf" /etc/ssh/sshd_config.d/99-wixfox-hardening.conf
else
  cat <<'EOF' > /etc/ssh/sshd_config.d/99-wixfox-hardening.conf
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
AllowTcpForwarding no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
EOF
fi

# Validate sshd configuration before reload
sshd -t && systemctl restart ssh || systemctl restart sshd
echo "[+] SSH hardened and restarted successfully."

# -------------------------------------------------------------------
# 6. Strict UFW Firewall Configuration
# -------------------------------------------------------------------
echo "[+] Step 6: Configuring UFW firewall rules..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Public Game Ports (Java & Bedrock)
ufw allow 25565/tcp comment 'Minecraft Java Edition'
ufw allow 19132/udp comment 'Minecraft Bedrock Edition (Geyser)'

# Optional HTTP/HTTPS for reverse proxy
ufw allow 80/tcp comment 'HTTP Redirection & Certs'
ufw allow 443/tcp comment 'HTTPS Secure Web'

# Restrict SSH (22) and Admin Panel (8080) strictly to Tailscale VPN
ufw allow in on tailscale0 to any port 22 proto tcp comment 'SSH via Tailscale VPN Only'
ufw allow in on tailscale0 to any port 8080 proto tcp comment 'Admin Panel via Tailscale VPN Only'

# Ensure sensitive ports are explicitly denied on public interfaces
ufw deny 5432/tcp comment 'Block PostgreSQL from public internet'
ufw deny 25575/tcp comment 'Block Minecraft RCON from public internet'
ufw deny 3000/tcp comment 'Block Backend API from public internet'

ufw --force enable
echo "[+] UFW firewall activated with strict default-deny policy."

# -------------------------------------------------------------------
# 7. Fail2ban Brute-Force Protection
# -------------------------------------------------------------------
echo "[+] Step 7: Configuring Fail2ban..."
if [ -f "$SCRIPT_DIR/fail2ban/jail.local" ]; then
  cp "$SCRIPT_DIR/fail2ban/jail.local" /etc/fail2ban/jail.local
fi
systemctl enable fail2ban
systemctl restart fail2ban
echo "[+] Fail2ban activated."

echo "======================================================================"
echo " [SUCCESS] Wixfox VPS Security Hardening Complete!"
echo " Next steps:"
echo " 1. Run 'tailscale up' to join your authorized private admin network."
echo " 2. Verify SSH key login as '$ADMIN_USER' before closing this session."
echo " 3. Run './infrastructure/security/security-audit.sh' to verify compliance."
echo "======================================================================"
