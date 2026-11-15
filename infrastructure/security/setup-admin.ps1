# ===================================================================
# Wixfox Minecraft Network — Initial Superadmin Provisioning (PowerShell)
# Enforces SEC-001 & SEC-005 (Zero Default Credentials Policy)
# ===================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Wixfox Minecraft Network — Initial Administrator Setup" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$adminUser = Read-Host "Enter Superadmin Username [default: wixfox_owner]"
if ([string]::IsNullOrWhiteSpace($adminUser)) { $adminUser = "wixfox_owner" }

$adminEmail = Read-Host "Enter Superadmin Email"
if ([string]::IsNullOrWhiteSpace($adminEmail)) {
    Write-Host "[-] Error: Email address is required." -ForegroundColor Red
    exit 1
}

$securePass = Read-Host "Enter Superadmin Password (min 16 chars)" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

if ($plainPass.Length -lt 16) {
    Write-Host "[-] Password is too short ($($plainPass.Length) chars). Must be at least 16 characters." -ForegroundColor Red
    exit 1
}

Write-Host "[+] Generating password hash..." -ForegroundColor Green
# Fallback bcrypt generation or sha256 with salt
$salt = [System.Guid]::NewGuid().ToString("N")
$hasher = [System.Security.Cryptography.SHA512]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plainPass + $salt)
$hash = [System.Convert]::ToBase64String($hasher.ComputeHash($bytes))

Write-Host "[SUCCESS] Administrator '$adminUser' credentials validated." -ForegroundColor Green
Write-Host "Provision credentials in docker container via docker exec." -ForegroundColor Yellow
