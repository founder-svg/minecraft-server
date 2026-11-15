# Wixfox Game Control Centre

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](README.md)
[![Platform](https://img.shields.io/badge/Platform-Web%20Admin%20Console-brightgreen.svg)](index.html)

**Wixfox Game Control Centre** is a centralized, responsive administration panel designed to give authorized staff members full control over gameplay, players, game modes, file management, and server administration for the **Wixfox Minecraft Network**.

---

## 🌟 Key Features

1. **Dashboard & Live Telemetry**:
   - Real-time online player count (`12 / 100`)
   - Steady TPS (`20.00`) and MSPT (`45ms`) monitoring
   - Database health (`98%`) and server uptime
   - Live Canvas Waveform chart visualizing performance metrics
   - Real-time activity feed and system operational badges

2. **Game Mode Management (PRD Section 4)**:
   - Change staff or player game mode with single-click actions (`Survival`, `Creative`, `Adventure`, `Spectator`)
   - Hardcore Configuration Module: Independent world-level Hardcore rules with safety backup requirements

3. **Player Control Centre (PRD Section 5)**:
   - Instant Kill (`/kill <player>`) with target verification and exempt protections
   - Kick, Ban, and IP-Ban management with sensitive IP masking (`192.168.*.*`)
   - Heal, Feed, Freeze, and Teleportation tools

4. **Staff Roles & RBAC (PRD Section 3)**:
   - **Owner / Super Admin**: Full unrestricted control
   - **Admin**: Player management, instant kill, bans, IP-bans, asset management
   - **Moderator**: Player monitoring, kicks, mutes, bans (no plugin or kill permissions)
   - **Developer**: Technical logs, staging asset uploads, testing game modes

5. **Server Command Console (PRD Section 7)**:
   - Interactive RCON terminal command dispatcher
   - Real-time server log filtering and execution history

---

## 🚀 How to Run

### Option 1: Open Directly in Any Web Browser
Simply double-click or open `index.html` in your favorite web browser (Chrome, Edge, Firefox). Zero installation or build step needed!

### Option 2: Run with Node.js Server
```bash
node server.js
```
Then visit: `http://localhost:8085`
