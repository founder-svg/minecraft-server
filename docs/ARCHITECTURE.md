# System Architecture — Wixfox Minecraft Network

## 1. Core Principles

The Wixfox Minecraft Network is built upon four foundational design principles:

1. **Dual-Platform Parity**: Minecraft Java Edition and Bedrock Edition players connect to the exact same persistent world, economy, and permission framework without feature disparity.
2. **Main Thread Isolation**: No plugin or task is permitted to perform blocking I/O (database, disk, network HTTP) on Paper's main tick loop. All relational queries use HikariCP asynchronously.
3. **Immutable Auditing**: Every economy transaction, moderation action, and administrative adjustment is recorded in dedicated append-only PostgreSQL tables.
4. **Reproducible Containerization**: The entire ecosystem—from Paper to PostgreSQL, NestJS API, and React frontend—is orchestrated using standardized Docker containers.

---

## 2. Component Topology

```
[ Bedrock Clients (UDP 19132) ] ────────┐
                                        │
                                  [ GeyserMC ]
                                  [ Floodgate ]
                                        │
[ Java Clients (TCP 25565) ] ──────────┼───> [ Paper Server 1.20.4 (Java 21) ]
                                        │         ├── NetworkCore (HikariCP)
                                        │         ├── PlayerManager
                                        │         ├── EconomyCore (Vault)
                                        │         ├── RankManager (Chat format)
                                        │         ├── ModerationCore
                                        │         ├── LandProtection
                                        │         └── LobbyCore
                                        │                    │
                                        │                    ▼
[ Admin Web Panel (HTTPS 443) ] ──> [ Nginx ] ──> [ PostgreSQL 16 (17 Tables) ]
                                        │                    ▲
                                        └───> [ NestJS API ] ─┘
```

---

## 3. Network Capacity & Tuning (20 Concurrent Players)

| Setting | Value | Rationale |
|---|---|---|
| RAM Min / Max | `4G / 5G` | Optimized for Aikar's G1GC with 20 players |
| View Distance | `8` | Balances visual immersion with chunk cache size |
| Simulation Distance | `6` | Minimizes active entity and redstone ticks |
| Network Compression | `256` | Reduces bandwidth without CPU penalty |
| Target TPS | `20.0` | Steady 50ms tick budget |
| Max MSPT | `< 30ms` | Ample headroom before tick degradation |
