#!/usr/bin/env bash
# ===================================================================
# Wixfox Minecraft Network — Pre-Deployment Secrets Validator
# Verifies that no default or placeholder secrets exist before launch
# ===================================================================

set -e

ENV_FILE=${1:-".env"}
ERRORS=0

echo "[*] Checking secrets in '$ENV_FILE'..."

if [ ! -f "$ENV_FILE" ]; then
  echo "[-] ERROR: File '$ENV_FILE' not found!"
  exit 1
fi

check_secret() {
  local var_name="$1"
  local val
  val=$(grep "^${var_name}=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

  if [ -z "$val" ]; then
    echo "[-] FAILED: ${var_name} is empty!"
    ERRORS=$((ERRORS + 1))
  elif [[ "$val" == *"replace_with"* ]] || [[ "$val" == *"password"* ]] || [[ "$val" == *"admin"* ]] || [[ "$val" == *"secret"* ]]; then
    echo "[-] FAILED: ${var_name} contains placeholder or insecure value: '$val'"
    ERRORS=$((ERRORS + 1))
  elif [ ${#val} -lt 16 ]; then
    echo "[-] FAILED: ${var_name} is too short (<16 chars, found ${#val} chars)!"
    ERRORS=$((ERRORS + 1))
  else
    echo "[+] PASSED: ${var_name} meets entropy requirements (${#val} chars)."
  fi
}

check_secret "POSTGRES_PASSWORD"
check_secret "RCON_PASSWORD"
check_secret "JWT_SECRET"

# Check .gitignore
if grep -q "^\.env$" .gitignore; then
  echo "[+] PASSED: .env is correctly listed in .gitignore"
else
  echo "[-] FAILED: .env is NOT in .gitignore!"
  ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "=========================================================="
  echo "[-] VALIDATION FAILED: Found $ERRORS security issues in secrets!"
  echo "Run './infrastructure/security/generate-secrets.sh' to fix."
  echo "=========================================================="
  exit 1
else
  echo "=========================================================="
  echo "[+] ALL SECRETS VERIFIED: Ready for production deployment."
  echo "=========================================================="
  exit 0
fi
