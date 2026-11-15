# Wixfox Minecraft Network

[![CI / CD Build](https://github.com/founder-svg/minecraft-server/actions/workflows/docker-build.yml/badge.svg)](https://github.com/founder-svg/minecraft-server/actions)
[![Security Scan](https://github.com/founder-svg/minecraft-server/actions/workflows/security-scan.yml/badge.svg)](https://github.com/founder-svg/minecraft-server/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Minecraft Version](https://img.shields.io/badge/Minecraft-Java%201.20.4+%20%7C%20Bedrock-brightgreen.svg)](https://papermc.io)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue.svg)](https://www.postgresql.org/)

**Wixfox Minecraft Network** is an enterprise-grade, cross-platform Minecraft multiplayer platform built for both **Minecraft Java Edition** and **Minecraft Bedrock Edition (Pocket Edition)** players. Engineered for stability, persistent player identities, ACID-compliant economy transactions, web administration, and automated container deployment via **Docker** and **GitHub Actions**.

---

## 🌟 Key Features

- 🎮 **Cross-Platform Multiplayer**: Seamless crossplay between Java Edition (TCP `25565`) and Bedrock Edition (UDP `19132`) via **GeyserMC** and **Floodgate**.
- 🚀 **Initial Capacity**: Optimized for **20 concurrent players** with stable 20 TPS, low MSPT (<50ms), and custom chunk/entity limits.
- 🗄️ **PostgreSQL 16 Persistence**: Centralized relational database storing player profiles, internal UUIDs, transaction ledger, ranks, punishments, and land claims.
- 🧩 **Modular Custom Java Plugins**:
  - `NetworkCore`: HikariCP connection pooling, PostgreSQL DAO layer, network event bus.
  - `PlayerManager`: Cross-platform identity resolution, login tracking, player stats.
  - `EconomyCore`: ACID-compliant financial transactions with Vault API compatibility.
  - `RankManager`: Role-based rank hierarchy with Adventure MiniMessage chat formatting.
  - `ModerationCore`: Bans, mutes, kicks, warnings, and login-stage pre-checks.
  - `LandProtection`: Chunk-based land claims with permission flags and trust levels.
  - `LobbyCore`: Spawn management, void safety, navigation compass GUI, spawn protection.
- 🖥️ **Administration Platform**:
  - **Backend API**: NestJS REST & WebSocket API with JWT authentication and RCON bridge.
  - **Admin Dashboard**: Modern React + TypeScript + TailwindCSS web control panel.
- 🐳 **Containerized Infrastructure**: Fully reproducible multi-container deployment via Docker Compose.
- 🔄 **GitHub CI/CD**: Automated compilation, testing, Docker image building (GHCR), and zero-downtime VPS deployment.

---

## 🏗️ Architecture Overview

```
                                  [ INTERNET ]
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
    [ Java Client ]              [ Bedrock Client ]            [ Admin Browser ]
      TCP 25565                    UDP 19132                     HTTPS 443 / 80
           │                            │                            │
           │                            ▼                            ▼
           │                      [ GeyserMC ]              [ Nginx Reverse Proxy ]
           │                      [ Floodgate ]                      │
           │                            │               ┌────────────┴────────────┐
           ▼                            ▼               ▼                         ▼
  ┌───────────────────────────────────────────────┐ [ Admin Dashboard ]   [ NestJS Backend ]
  │           Paper Minecraft Server              │ (React Single Page)   (Port 3000)
  │  ───────────────────────────────────────────  │                               │
  │  • NetworkCore      • PlayerManager           │                               │
  │  • EconomyCore      • RankManager             │                               │
  │  • ModerationCore   • LandProtection          │                               │
  │  • LobbyCore        • World / Chunks / Entity │                               │
  └───────────────────────┬───────────────────────┘                               │
                          │                                                       │
                          ▼                                                       ▼
                ┌───────────────────────────────────────────────────────────────────┐
                │                    PostgreSQL 16 Database                         │
                │     17 tables: players, profiles, balances, ranks, claims...       │
                └───────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Layout

```
wixfox-minecraft-network/
│
├── minecraft/                  # Server binaries, configs, Geyser/Floodgate
│   ├── paper/                  # paper-global.yml, server.properties, spigot.yml
│   ├── geyser/                 # Geyser config (port 19132, floodgate auth)
│   ├── floodgate/              # Floodgate config & key exchange
│   └── configs/                # Shared configurations & MOTDs
│
├── plugins/                    # Java 21 Paper plugins (Maven multi-module)
│   ├── pom.xml                 # Parent POM for all plugins
│   ├── network-core/           # Connection pooling & shared utilities
│   ├── player-manager/         # Unified identities & statistics
│   ├── economy-core/           # Currency & Vault integration
│   ├── rank-manager/           # Permissions & chat prefixes
│   ├── moderation-core/        # Bans, kicks, mutes, warnings
│   ├── land-protection/        # Territorial claiming system
│   └── lobby-core/             # Spawn, navigation GUI & rules
│
├── backend/                    # NestJS REST & WebSocket API
│   ├── src/                    # Auth, Players, Servers, Economy, Moderation
│   ├── Dockerfile              # Production Node.js container
│   └── package.json
│
├── admin-panel/                # React + TypeScript + Tailwind Admin Panel
│   ├── src/                    # Dashboard, Player Management, Server Health
│   ├── Dockerfile              # Multi-stage Nginx container
│   └── package.json
│
├── mobile-app/                 # Future Capacitor mobile management client
│
├── database/                   # Database schemas and migrations
│   ├── migrations/             # Versioned SQL migrations (Flyway compatible)
│   ├── schema/                 # Base PostgreSQL DDL (17 tables)
│   └── seeds/                  # Default ranks, permissions, and admin user
│
├── infrastructure/             # DevOps & deployment scripts
│   ├── docker/                 # Custom Dockerfiles (Paper runtime)
│   ├── nginx/                  # Nginx reverse proxy configuration
│   ├── monitoring/             # Prometheus configuration
│   └── scripts/                # Automated backup & restore shell scripts
│
├── tests/                      # Synthetic load testing scripts
├── docs/                       # Technical specifications & guides
├── .github/workflows/          # CI/CD automated build & deploy workflows
├── docker-compose.yml          # Production multi-service orchestration
└── .env.example                # Sample environment variables
```

---

## 🚀 Quick Start (Development / Local Setup)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- Java Development Kit (JDK) 21 (optional for compiling plugins locally)
- Node.js 20+ (optional for frontend/backend local dev)

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/founder-svg/minecraft-server.git
cd minecraft-server

# Copy sample environment configuration
cp .env.example .env

# Edit .env with your desired passwords and secrets
nano .env
```

### 2. Build & Launch Containers
```bash
# Build custom plugin suite, backend, and admin panel
docker compose build

# Start all services in detached mode
docker compose up -d
```

### 3. Verify System Health
```bash
# Check running containers
docker compose ps

# View Minecraft server logs
docker compose logs -f minecraft

# View Backend API logs
docker compose logs -f backend
```

Once started:
- **Minecraft Java Edition**: Connect to `localhost:25565`
- **Minecraft Bedrock Edition**: Connect to `localhost` on port `19132`
- **Admin Dashboard**: Open `http://localhost:8080` (or via private Tailscale VPN). Run `./infrastructure/security/setup-admin.sh` to generate your initial high-entropy Owner/Superadmin credentials. (Zero default passwords are accepted).
- **Backend API**: Accessible internally at `http://localhost:3000/api`

---

## 💾 Database Schema Summary

The database uses PostgreSQL 16 with UUID primary keys and strict relational constraints across **17 core tables**:

1. `players`: Primary player registry (internal UUID, username, account status).
2. `player_identities`: Platform mappings (`JAVA` vs `BEDROCK` Floodgate UUIDs).
3. `player_profiles`: Playtime, last IP, first/last login dates.
4. `player_statistics`: PvP kills, deaths, mob kills, blocks broken/placed.
5. `player_balances`: Liquid player currency balances (`NUMERIC(15,2)`).
6. `economy_transactions`: Immutable audit ledger with transaction types (`PAY`, `ADMIN`, `SHOP`).
7. `ranks`: System rank definitions (`Default`, `VIP`, `Premium`, `Moderator`, `Admin`, `Owner`).
8. `player_ranks`: Rank assignments with optional expiry dates.
9. `permissions`: Permission nodes assigned to ranks.
10. `punishments`: Active and historical bans, mutes, kicks, and warnings.
11. `player_sessions`: Detailed session duration tracking.
12. `servers`: Cluster server registry for multi-server scalability.
13. `player_achievements`: Custom server achievements.
14. `land_claims`: Protected chunks with PvP toggles and trust permissions.
15. `admin_users`: Web dashboard administrative accounts with bcrypt passwords.
16. `audit_logs`: Detailed audit trail of administrative actions.
17. `backup_records`: History and verification metrics of system backups.

---

## 🛡️ Security & Crossplay Best Practices

- **Zero Cleartext Credentials**: No production passwords or keys are ever committed to version control.
- **Floodgate Secure Keys**: Bedrock authentication is validated with a private key exchange; usernames alone are never trusted.
- **Isolated Ports**: Only TCP `25565`, UDP `19132`, and HTTP/HTTPS `80`/`443` are exposed to the public internet. PostgreSQL (`5432`) and RCON (`25575`) remain strictly internal within the Docker network.
- **Asynchronous Execution**: All custom plugins execute database queries off the Paper main thread using `CompletableFuture` and HikariCP connection pooling to prevent TPS degradation.

---

## 🛠️ Automated Backups & Disaster Recovery

Backups are automated using the scripts located in `infrastructure/scripts/`:
- **Database Backup**: `pg_dump` snapshot compressed as `.sql.gz`.
- **World & Config Backup**: Atomic tar archive of world data (`tar -czf`).
- **Retention**: 7 daily snapshots, 4 weekly snapshots, 3 monthly snapshots.

To trigger a manual backup:
```bash
docker compose exec backend ./infrastructure/scripts/backup.sh
```

To restore from a backup:
```bash
./infrastructure/scripts/restore.sh <backup-timestamp>
```

---

## 📄 License
This project is proprietary to **Wixfox Technologies**. All rights reserved.
