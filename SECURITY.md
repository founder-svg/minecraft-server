# Security Policy & Cyberattack Prevention — Wixfox Minecraft Network
**Version 1.0 (16 November 2026)**  
**Prepared by:** Wixfox Technologies  

---

## 1. Vulnerability Disclosure & Bug Bounty

Wixfox Technologies takes the security of the Wixfox Minecraft Network, our infrastructure, and our players' information very seriously.

If you discover a security vulnerability in this repository, Minecraft server configuration, custom plugins, or backend services:

**Please DO NOT open a public GitHub issue.**

Submit your vulnerability report privately to:
* **Security Contact:** `security@wixfox.net`
* **Subject Line:** `[Vulnerability Report] Wixfox Minecraft Network`
* **PGP Key:** Available upon request or via `security@wixfox.net`

### Report Requirements:
1. Detailed description of the vulnerability.
2. Reproduction steps (including proof of concept scripts or commands if safe).
3. Potential impact on server stability, infrastructure, or player data.
4. Suggested remediations.

### Response SLA:
* **Initial Acknowledgment:** Within **24–48 hours**.
* **Triage & Assessment:** Within **72 hours**.
* **Patch Release & Advisory:** Dependent on severity (Critical: <24h, High: <7 days).

---

## 2. Supported Versions

| Component | Target Version | Supported | Status |
|---|---|---|---|
| **Paper Minecraft Server** | 1.20.4+ / 1.21.x | :white_check_mark: | Active Support |
| **GeyserMC & Floodgate** | Latest Release (v2.2.3+) | :white_check_mark: | Active Support |
| **PostgreSQL** | 16.x Alpine | :white_check_mark: | Active Support |
| **NestJS Backend API** | 10.x | :white_check_mark: | Active Support |
| **Tailscale Private VPN** | 1.60.x+ | :white_check_mark: | Mandatory for Admin |
| **CrowdSec / Fail2ban** | Latest | :white_check_mark: | Active Support |

---

## 3. The 10 Non-Negotiable Security Policies

1. **No Public Database or RCON:** PostgreSQL (5432) and RCON (25575) must never be bound to `0.0.0.0` or exposed to the public internet.
2. **No Public Administrative Interface:** The Admin Console must only be accessible over the private Tailscale VPN network.
3. **No Default Credentials:** No server, database, or API service may run with placeholder or default passwords.
4. **No Secrets in Source Code:** Passwords, API tokens, Floodgate private keys, and JWT secrets must never be committed to Git.
5. **No Unreviewed Plugins on Production:** All plugins must pass source verification, dependency scanning, and staging testing before production deployment.
6. **No Shared Administrator Accounts:** Every staff member must possess an individual account with audited actions.
7. **No Unaudited Production Changes:** All administrative actions must be permanently logged in the immutable audit ledger.
8. **No Cloudflare Web Proxy for Game Ports:** Standard Cloudflare web proxy must not be assumed to protect TCP 25565 or UDP 19132.
9. **No Production Launch Without Tested Restores:** A backup is considered non-existent until restoration has been verified.
10. **No Claim of Immunity:** Defense-in-depth assumes attacks will occur; containment and rapid recovery are mandatory.

---

## 4. Port Exposure Matrix

* **Publicly Accessible:**
  * `25565/tcp` — Minecraft Java Game Traffic (via proxy/firewall)
  * `19132/udp` — Minecraft Bedrock Game Traffic (via Geyser/Floodgate)
* **Private / VPN Only (Tailscale):**
  * `22/tcp` — SSH Host Access
  * `8080/tcp` — Admin Console Web Dashboard
* **Internal Docker Only (No Ingress):**
  * `5432/tcp` — PostgreSQL 16
  * `25575/tcp` — Paper RCON Terminal
  * `3000/tcp` — NestJS Administration API

---

For full architectural blueprints, see [`docs/SECURITY_ARCHITECTURE.md`](docs/SECURITY_ARCHITECTURE.md).
