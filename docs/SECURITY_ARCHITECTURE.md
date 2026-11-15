# Wixfox Minecraft Network — Security & Cyberattack Prevention Architecture
**Security Specification Version 1.0**  
**Date:** 16 November 2026  
**Company:** Wixfox Technologies  
**Target:** Cloud VPS + Docker (Ubuntu 22.04/24.04 LTS)  
**Budget:** ₹0 initially — utilizing battle-tested open-source and free-tier technologies  
**Team Size:** 3–5 authorized team members  

---

## 1. Executive Summary & Principles

The **Wixfox Minecraft Network** is an enterprise-grade multiplayer environment engineered for crossplay between **Minecraft Java Edition** and **Minecraft Bedrock Edition** (via GeyserMC and Floodgate). 

Because the network operates on the public internet, it is exposed to automated port scanners, volumetric DDoS attacks, UDP amplification floods, SSH brute-force campaigns, credential theft, and application-layer exploits.

### Core Security Principle
> **Public players must only access the game services required to play (TCP 25565 and UDP 19132). All administrative, database, infrastructure, deployment, and monitoring systems must remain completely invisible to the public internet, isolated behind strict authentication, network segmentation, and private VPN tunnels.**

---

## 2. Security Objectives & Requirement Matrix

| ID | Objective | Description | Priority |
|---|---|---|---|
| **SEC-001** | Protect VPS from Unauthorized Access | Prevent root compromise, disable password SSH, enforce public-key authentication over VPN. | **Critical** |
| **SEC-002** | Protect Java & Bedrock Game Traffic | Mitigate TCP/UDP flooding, bot attacks, and packet malformations. | **Critical** |
| **SEC-003** | Prevent Public Access to DB & RCON | Restrict PostgreSQL (5432) and RCON (25575) strictly to internal Docker bridge. | **Critical** |
| **SEC-004** | Secure Admin Panel and Backend APIs | Enforce JWT authentication, Argon2id/bcrypt hashing, rate limiting, and CORS restrictions. | **Critical** |
| **SEC-005** | Prevent Brute Force & Credential Theft | Implement Fail2ban, CrowdSec, progressive lockout delays, and strict password complexity. | **Critical** |
| **SEC-006** | Secure Docker Containers & Host | Run containers as non-root, drop Linux capabilities, restrict container-to-host privilege escalation. | **Critical** |
| **SEC-007** | Protect GitHub & CI/CD Pipelines | Pinned workflow actions, branch protection rules, TruffleHog/Gitleaks secret scanning. | **High** |
| **SEC-008** | Detect Suspicious Activity & Attacks | CrowdSec log parsing, Uptime Kuma health probes, real-time security telemetry. | **High** |
| **SEC-009** | Secure Backups & Disaster Recovery | AES-256 GPG-encrypted automated backups, SHA-256 checksums, 7/4/3 retention policy. | **High** |
| **SEC-010** | Staff Permissions & Accountability | 4-tier Role-Based Access Control (Owner, Admin, Moderator, Developer) with audit trail. | **High** |
| **SEC-011** | Protect Player Information | Mask player IP addresses, encrypt Floodgate private keys, zero plaintext credentials. | **High** |
| **SEC-012** | Enable Future Security Scaling | Architecture modularity to scale seamlessly from 20 to 200+ concurrent players. | **Medium** |

---

## 3. Defense-in-Depth: The 7 Security Layers

```
========================================================================
LAYER 1: INTERNET
Public Java & Bedrock Players • Website Visitors • External Traffic
========================================================================
                               |
                               v
========================================================================
LAYER 2: NETWORK-LEVEL MITIGATION
Cloudflare (DNS & Web WAF) • Minecraft TCP/UDP Game Proxy (TCPShield/Playit.gg)
VPS Provider DDoS Scrubbing (OVH / Hetzner / Oracle Cloud)
========================================================================
                               |
                               v
========================================================================
LAYER 3: VPS HOST FIREWALL (UFW / nftables)
Default Deny Incoming • Strict Port Whitelist • Kernel SYN Cookie Protection
========================================================================
                               |
                               v
========================================================================
LAYER 4: INTRUSION DETECTION & BRUTE-FORCE DEFENSE
CrowdSec Security Engine • Fail2ban Jails • Real-Time IP Bouncers
========================================================================
                               |
                               v
========================================================================
LAYER 5: APPLICATION & ACCESS CONTROL
Paper 1.20.4 Hardening • Geyser/Floodgate Encryption • Tailscale Private VPN
NestJS JWT & Rate Limiting • Role-Based Access Control (RBAC)
========================================================================
                               |
                               v
========================================================================
LAYER 6: INFRASTRUCTURE & DATA HARDENING
Docker Network Segmentation • Non-Root Containers • No-New-Privileges
Isolated PostgreSQL • Encrypted GPG Backups (AES-256)
========================================================================
                               |
                               v
========================================================================
LAYER 7: DISASTER RECOVERY & ROLLBACK
Automated Recovery Scripts • Immutable Audit Trails • RPO < 24h • RTO < 4h
========================================================================
```

---

## 4. Port Access Control & Network Boundary Policy

| Port | Protocol | Service | Public Access | Authorized Ingress Path |
|---|---|---|---|---|
| **25565** | TCP | Minecraft Java Edition | **ALLOWED** | Public Game Traffic / Approved TCP Proxy |
| **19132** | UDP | Minecraft Bedrock Edition (Geyser) | **ALLOWED** | Public Game Traffic / Approved UDP Proxy |
| **443** | TCP | HTTPS Web Services | **CONDITIONAL** | Protected through Cloudflare WAF if deployed |
| **80** | TCP | HTTP Web Redirection | **CONDITIONAL** | ACME Let's Encrypt challenge or HTTP->HTTPS redirect |
| **22** | TCP | SSH Host Administration | **DENIED** | **Tailscale Private VPN Only** (`tailscale0` interface) |
| **8080** | TCP | Wixfox Admin Panel Web UI | **DENIED** | **Tailscale Private VPN Only** (`127.0.0.1` / `tailscale0`) |
| **3000** | TCP | NestJS Backend API | **DENIED** | Internal Docker Network only (`wixfox-internal`) |
| **5432** | TCP | PostgreSQL 16 Database | **DENIED** | Internal Docker Network only (`wixfox-internal`) |
| **25575** | TCP | Minecraft RCON Command Port | **DENIED** | Internal Docker Network only (`wixfox-internal`) |

---

## 5. DDoS & Network Protection Implementation

### 5.1 Java Edition (TCP 25565)
* Volumetric and layer 7 bot attacks (join/ping floods) are mitigated using a Minecraft-compatible TCP reverse proxy (such as **TCPShield** free tier or **Playit.gg**) combined with VPS provider-level edge scrubbing.
* In `bukkit.yml`, `connection-throttle: 4000` is enforced to prevent rapid reconnect spam from a single IP.
* Origin IP masking ensures attackers cannot bypass edge protection.

### 5.2 Bedrock Edition (UDP 19132)
* Bedrock traffic is connectionless UDP, making it susceptible to reflection and amplification floods.
* Protection is deployed using UDP-capable tunneling or a host provider with native Game Anti-DDoS (e.g. OVH Game Anti-DDoS, Hetzner, or Oracle Cloud Infrastructure).
* In Geyser's `config.yml`, `enable-proxy-connections: true` is configured to validate Floodgate handshake signatures.

### 5.3 Cloudflare Web Policy
* Cloudflare Free Tier protects the DNS infrastructure and any public web endpoints (`wixfox.com`).
* **Critical Clarification:** Cloudflare's standard free web proxy **does NOT** protect Minecraft game ports (25565 TCP or 19132 UDP). The team must never rely on standard Cloudflare orange-cloud proxies for game traffic.

---

## 6. Private Administration & Tailscale VPN

To ensure that the Admin Console and SSH management are inaccessible to automated scanners:
1. **Tailscale VPN** is installed on the Ubuntu host.
2. Only devices belonging to the 3–5 authorized staff members are enrolled in the Tailscale network.
3. Multi-Factor Authentication (MFA) is enforced on the identity provider (Google Workspace / GitHub SSO).
4. SSH (`sshd`) binds exclusively to the private Tailscale interface (`tailscale0` / `100.x.y.z`).
5. The Admin Panel container binds only to `127.0.0.1:8080`, accessible only through an SSH tunnel or Tailscale Serve.

---

## 7. VPS & Operating System Hardening

### 7.1 SSH Daemon Hardening (`/etc/ssh/sshd_config.d/99-wixfox-hardening.conf`)
```ini
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
AllowTcpForwarding no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
KbdInteractiveAuthentication no
UsePAM yes
```

### 7.2 Kernel Network Protection (`/etc/sysctl.d/99-wixfox-security.conf`)
* `net.ipv4.tcp_syncookies = 1` (Protects against TCP SYN flood attacks)
* `net.ipv4.conf.all.rp_filter = 1` (Rejects spoofed IP packets)
* `net.ipv4.conf.all.accept_redirects = 0` (Blocks ICMP redirect attacks)
* `net.ipv4.icmp_echo_ignore_broadcasts = 1` (Prevents Smurf amplification attacks)

---

## 8. Docker Container Security & Isolation

1. **Non-Root Execution:** All application containers run as dedicated unprivileged users (`UID 1000` / `node` / `postgres`).
2. **Capability Dropping:** Containers drop all Linux capabilities (`cap_drop: [ALL]`), adding back only minimal requirements (`NET_BIND_SERVICE`).
3. **No-New-Privileges:** `security_opt: [no-new-privileges:true]` is set to block suid escalation inside containers.
4. **Socket Protection:** The Docker daemon socket (`/var/run/docker.sock`) is **never mounted** into any application container.
5. **Resource Quotas:** Strict memory and CPU limits are defined in `docker-compose.yml` to prevent denial-of-service via resource starvation:
   * `postgres`: 1.0 CPU, 1.5GB RAM
   * `minecraft`: 2.5 CPU, 5.0GB RAM
   * `backend`: 1.0 CPU, 1.0GB RAM
   * `admin-panel`: 0.5 CPU, 512MB RAM

---

## 9. Encrypted Backups & Disaster Recovery

### 9.1 Encryption & Integrity Specification
* **Cipher:** AES-256 via GPG symmetric encryption (`gpg --symmetric --cipher-algo AES256`).
* **Integrity:** Every archive produces an accompanying `.sha256` checksum file.
* **Separation:** Backup encryption keys are stored outside the live server directory.

### 9.2 Retention Schedule (7-4-3 Policy)
* **Daily Snapshots:** Retained for 7 days.
* **Weekly Snapshots:** Retained for 4 weeks.
* **Monthly Archives:** Retained for 3 months.
* **Pre-Deployment Snapshots:** Captured before any major update or plugin change.

### 9.3 Recovery Targets
* **Recovery Point Objective (RPO):** Maximum 24 hours (worst-case scenario).
* **Recovery Time Objective (RTO):** Under 4 hours from total VPS failure to full network operational status.

---

## 10. Incident Response Runbook

### 10.1 Severity Classification
* **Severity 1 (Critical):** Host VPS compromise, unauthorized root login, public database leak, or total service destruction.
* **Severity 2 (High):** Admin panel credential compromise, suspected player data exposure, or targeted layer 7 bot attack.
* **Severity 3 (Medium):** Repeated SSH brute-force attempts, unauthorized plugin attempt in staging, or isolated player griefing.
* **Severity 4 (Low):** Automated port probe blocked by UFW, single failed login, or minor chat spam.

### 10.2 Emergency Containment Procedure
1. **Isolate:** Disconnect external network ingress using the VPS provider control panel firewall or execute `ufw default deny outgoing`.
2. **Revoke:** Invalidate all active JWT tokens, rotate PostgreSQL and RCON credentials, and revoke compromised Tailscale node keys.
3. **Snapshot:** Preserve volatile memory and log files for forensic analysis.
4. **Clean Rebuild:** Destroy compromised container instances and rebuild strictly from clean, pinned GitHub releases.
5. **Restore:** Restore from the latest verified GPG-encrypted backup archive.
6. **Post-Mortem:** Complete an incident report within 48 hours detailing attack vector, impact, and preventive remediation.

---

## 11. 22-Point Production Acceptance Checklist

| # | Acceptance Requirement | Status |
|---|---|---|
| 1 | Ubuntu VPS hardened & `unattended-upgrades` active | `[ ]` |
| 2 | Root SSH login completely disabled (`PermitRootLogin no`) | `[ ]` |
| 3 | SSH restricted strictly to authorized private VPN (`tailscale0`) | `[ ]` |
| 4 | Firewall default-deny incoming policy enabled (`ufw default deny incoming`) | `[ ]` |
| 5 | Only game ports (TCP 25565 / UDP 19132) open to public | `[ ]` |
| 6 | Java TCP flood protection configured and verified | `[ ]` |
| 7 | Bedrock UDP flood protection configured and verified | `[ ]` |
| 8 | Origin IP masked and direct-to-origin bypass blocked | `[ ]` |
| 9 | Admin Panel web interface inaccessible from public internet | `[ ]` |
| 10 | PostgreSQL port 5432 inaccessible from public internet | `[ ]` |
| 11 | Minecraft RCON port 25575 inaccessible from public internet | `[ ]` |
| 12 | Default administrator passwords and secrets removed | `[ ]` |
| 13 | High-entropy production secrets generated and verified | `[ ]` |
| 14 | Docker containers hardened (non-root, no-new-privileges, resource limits) | `[ ]` |
| 15 | GitHub `main` branch protected with required pull request reviews | `[ ]` |
| 16 | Production deployment approval gates configured in CI/CD | `[ ]` |
| 17 | Staff MFA and least-privilege RBAC roles active | `[ ]` |
| 18 | CrowdSec / Fail2ban intrusion detection active and verified | `[ ]` |
| 19 | GPG AES-256 encrypted automated backup pipeline operational | `[ ]` |
| 20 | Backup restoration procedure successfully tested on staging | `[ ]` |
| 21 | Incident response runbook documented and distributed to staff | `[ ]` |
| 22 | Automated security audit script (`security-audit.sh`) passes with 100% | `[ ]` |

---

## 12. The 10 Non-Negotiable Security Policies

1. **No Public Database or RCON:** PostgreSQL (5432) and RCON (25575) must never be bound to `0.0.0.0` or exposed publicly.
2. **No Public Administrative Interface:** The Admin Console must only be accessible over the private Tailscale VPN.
3. **No Default Credentials:** No server, database, or API service may run with placeholder or default passwords.
4. **No Secrets in Source Code:** Passwords, API tokens, Floodgate keys, and JWT secrets must never be committed to Git.
5. **No Unreviewed Plugins on Production:** All plugins must pass source verification, dependency scanning, and staging testing.
6. **No Shared Administrator Accounts:** Every staff member must possess an individual account with audited actions.
7. **No Unaudited Production Changes:** All administrative actions must be permanently logged in the immutable audit ledger.
8. **No Cloudflare Web Proxy for Game Ports:** Standard Cloudflare web proxy must not be assumed to protect TCP 25565 or UDP 19132.
9. **No Production Launch Without Tested Restores:** A backup is considered non-existent until restoration has been verified.
10. **No Claim of Immunity:** Defense-in-depth assumes breaches will be attempted; containment and rapid recovery are mandatory.
