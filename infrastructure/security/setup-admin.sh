#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — Initial Superadmin Provisioning Script
# Enforces SEC-001 & SEC-005 (Zero Default Credentials Policy)
# ===================================================================

set -e

echo "======================================================================"
echo " Wixfox Minecraft Network — Initial Administrator Setup"
echo "======================================================================"

read -p "Enter Superadmin Username [default: wixfox_owner]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-"wixfox_owner"}

read -p "Enter Superadmin Email: " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    echo "[-] Error: Email address is required."
    exit 1
fi

# Secure password prompt
prompt_password() {
    prompt="Enter Superadmin Password (min 16 chars): "
    while IFS=p read -p "$prompt" -r -s PASS; do
        prompt=$'\nConfirm Password: '
        read -p "$prompt" -r -s PASS2
        echo ""
        if [ "$PASS" != "$PASS2" ]; then
            echo "[-] Passwords do not match. Try again."
            prompt="Enter Superadmin Password (min 16 chars): "
        elif [ ${#PASS} -lt 16 ]; then
            echo "[-] Password is too short (${#PASS} chars). Must be at least 16 characters."
            prompt="Enter Superadmin Password (min 16 chars): "
        else
            break
        fi
    done
}

prompt_password

echo "[+] Generating bcrypt hash for administrator password..."
# Generate bcrypt hash using python or node if available, or openssl
if command -v python3 &>/dev/null; then
    HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$PASS'.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8'))" 2>/dev/null || true)
fi

if [ -z "$HASH" ]; then
    # Fallback to Node.js bcrypt
    HASH=$(node -e "const b = require('bcrypt'); console.log(b.hashSync('$PASS', 12));" 2>/dev/null || true)
fi

if [ -z "$HASH" ]; then
    echo "[-] Error: Neither python3-bcrypt nor node-bcrypt is installed to hash the password."
    echo "[*] Install python3-bcrypt: pip install bcrypt"
    exit 1
fi

echo "[+] Inserting initial superadmin into PostgreSQL container..."
DB_CONTAINER="wixfox-postgres"
DB_NAME=${POSTGRES_DB:-"wixfox_network"}
DB_USER=${POSTGRES_USER:-"wixfox_admin"}

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES ('$ADMIN_USER', '$ADMIN_EMAIL', '$HASH', 'SUPERADMIN', TRUE)
ON CONFLICT (username) DO UPDATE 
SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, is_active = TRUE;
"

echo "======================================================================"
echo "[SUCCESS] Superadmin account '$ADMIN_USER' provisioned successfully!"
echo "Login URL: http://127.0.0.1:8080 (via Tailscale private VPN only)"
echo "Zero default passwords remain in the system."
echo "======================================================================"
