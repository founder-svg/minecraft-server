# Wixfox Minecraft Network — Live Connection & Client Delivery Guide
**Document Version:** 1.0.0  
**Target Platform:** Minecraft Java Edition + Bedrock Edition Crossplay  
**Hosting Model:** Cloud VPS (Game Engine & API) + GitHub Pages (Web Admin Console)  
**Brand Identity:** Wixfox Technologies ([wixfox.com](https://www.wixfox.com))

---

## 1. Important Architecture Note: GitHub IP vs Cloud VPS

> **CRITICAL CONCEPT:**
> - **GitHub Pages** (`founder-svg.github.io`) is a **static web hosting server**. It hosts the HTML/CSS/JavaScript Admin Console for 100% 24/7 uptime.
> - **GitHub cannot run a Minecraft game server, Docker daemon, or open TCP/UDP game ports.** Connecting Minecraft to a GitHub IP will fail because GitHub only listens on HTTP/HTTPS web ports (80/443).
> - The live Minecraft game engine (PaperMC + GeyserMC + PostgreSQL) runs on your **Cloud VPS** (Virtual Private Server) using the Docker configuration provided in this repository.

---

## 2. Network Ports & Connection Topology

```
                  ┌──────────────────────────────────────────────┐
                  │                 PLAYERS                      │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
            Java Edition (PC)    │                │  Bedrock Edition (Mobile/Console)
            TCP Port 25565       │                │  UDP Port 19132
                                 ▼                ▼
            ┌────────────────────────────────────────────────────┐
            │          Cloud VPS Public IP / Domain              │
            │           (e.g., play.wixfox.net)                  │
            │                                                    │
            │  ┌───────────────────┐    ┌─────────────────────┐  │
            │  │  Paper 1.20.4     │◄───┤  GeyserMC Crossplay │  │
            │  │  (TCP 25565)      │    │  (UDP 19132)        │  │
            │  └─────────┬─────────┘    └─────────────────────┘  │
            │            │                                       │
            │            │ Internal RCON (Port 25575)            │
            │            ▼                                       │
            │  ┌───────────────────┐                             │
            │  │  NestJS API Core  │ (Port 3000 /api)             │
            │  └─────────▲─────────┘                             │
            │            │ Internal SQL (Port 5432)              │
            │            ▼                                       │
            │  ┌───────────────────┐                             │
            │  │  PostgreSQL 16    │                             │
            │  └───────────────────┘                             │
            └────────────────────▲───────────────────────────────┘
                                 │ REST API / WebSocket
                                 │ (Port 3000 or Reverse Proxy)
            ┌────────────────────┴───────────────────────────────┐
            │            WIXFOX ADMIN CONSOLE                    │
            │  https://founder-svg.github.io/minecraft-server/   │
            │  (Also available locally via Tailscale VPN)        │
            └────────────────────────────────────────────────────┘
```

### Port Summary Table

| Service | Protocol | Port | Visibility | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Minecraft Java** | TCP | `25565` | **Public** | Connects PC, Mac, and Linux Java players |
| **Minecraft Bedrock** | UDP | `19132` | **Public** | Connects Android, iOS, Windows 10/11, Xbox, PlayStation, Switch players via GeyserMC |
| **Backend REST API** | TCP | `3000` | Protected / Reverse Proxy | Connects the GitHub Pages Admin Console to live RCON telemetry |
| **Web Admin Console**| HTTPS| `443` | **Public** | Hosted at `https://founder-svg.github.io/minecraft-server/` |
| **Minecraft RCON** | TCP | `25575`| **Internal Docker Only** | Remote console execution (blocked from public internet) |
| **PostgreSQL 16** | TCP | `5432` | **Internal Docker Only** | Persistent player databases and economy ledger |

---

## 3. How Players Connect to the Game

### A. Minecraft Java Edition Players (PC / Mac / Linux)
1. Launch Minecraft Java Edition (Version `1.20.4` or compatible).
2. Go to **Multiplayer** > **Add Server**.
3. Enter:
   - **Server Name:** `Wixfox Network`
   - **Server Address:** `play.wixfox.net:25565` (or `<YOUR_VPS_IP>:25565`)
4. Click **Done** and **Join Server**.

### B. Minecraft Bedrock Edition Players (Android, iOS, Console, Windows Bedrock)
1. Open Minecraft Bedrock / Pocket Edition.
2. Tap **Play** > **Servers** tab > Scroll down and tap **Add Server**.
3. Enter:
   - **Server Name:** `Wixfox Network`
   - **Server Address:** `play.wixfox.net` (or `<YOUR_VPS_IP>`)
   - **Port:** `19132` (Default Bedrock UDP port)
4. Tap **Save** and **Join Server**.
   - *Note: GeyserMC + Floodgate will seamlessly authenticate Bedrock players without requiring a second Java account.*

---

## 4. How the Admin Console Connects to the Live Server

The Wixfox Admin Console is hosted on GitHub Pages:
🔗 **`https://founder-svg.github.io/minecraft-server/`**

### Connecting Live Telemetry:
1. Open the Admin Console in any browser.
2. Click the **`🌐 Connect Game IP & Port`** button in the top status bar.
3. In the modal:
   - Verify the **Public Java Address** (`play.wixfox.net:25565`).
   - Verify the **Public Bedrock Address** (`play.wixfox.net` on port `19132`).
   - Enter your VPS Backend API URL (e.g., `https://api.wixfox.net/api` or `http://<YOUR_VPS_IP>:3000/api`).
4. Click **`📡 Ping Server Test`** to verify connectivity with the server engine.
5. Click **`Save Connection Settings`**.

---

## 5. Client Deployment Checklist (How to Hand Over to Client)

1. **Step 1: VPS Provisioning**
   - Rent an Ubuntu 22.04 / 24.04 LTS Cloud VPS (Recommended: 4 vCPU, 8 GB RAM).
2. **Step 2: Domain Setup (DNS A Record)**
   - In Cloudflare or domain registrar:
     - Add `A` record for `play.wixfox.net` pointing to the VPS Public IP.
3. **Step 3: Clone & Bootstrap on VPS**
   ```bash
   git clone https://github.com/founder-svg/minecraft-server.git
   cd minecraft-server
   cp .env.example .env
   # Set strong passwords in .env
   docker compose up -d
   ```
4. **Step 4: Deliver to Client**
   - Give the client the Admin Console link: `https://founder-svg.github.io/minecraft-server/`
   - Give the client player connection details: `play.wixfox.net:25565` (Java) & `play.wixfox.net:19132` (Bedrock).
   - If the client ever needs to reset the console to clean factory state, click the **`🔄 Factory Reset`** button in the header bar.
