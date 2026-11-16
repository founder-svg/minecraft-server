# Wixfox Minecraft Network — 100% GitHub Cloud Hosting Guide (4-Core / 16GB RAM)

This guide walks you through hosting the entire Wixfox Minecraft Crossplay Network, PostgreSQL database, and backend directly on **GitHub Cloud Infrastructure (GitHub Codespaces)**.

---

## ⚡ What GitHub Cloud Provides:
* **Compute:** **4 CPU Cores**
* **Memory:** **16 GB RAM**
* **Storage:** 32 GB NVMe SSD
* **Database:** Dedicated PostgreSQL 16 running directly on the cloud container
* **Network:** Global low-latency Anycast routing via Playit.gg Cloud Tunnel
* **Cost:** Included in GitHub free cloud allowance (60 core-hours / month free)
* **Auth:** `online-mode=false` configured — **"Failed to verify username" is completely eliminated!** Both Java and Bedrock crossplay players can join seamlessly.

---

## STEP 1: Launch Your 4-Core 16GB Codespace on GitHub

1. Go to your repository:  
   👉 **[https://github.com/founder-svg/minecraft-server](https://github.com/founder-svg/minecraft-server)**
2. Click the green **`<> Code`** button.
3. Click the **Codespaces** tab.
4. Click the three dots `...` and choose **"New with options..."**:
   * **Branch:** `main`
   * **Region:** Closest to your players (e.g. `Southeast Asia` or `Europe`)
   * **Machine type:** Select **`4-core, 16 GB RAM, 32 GB storage`**
5. Click **Create codespace**.

---

## STEP 2: Start the Server (1 Single Command)

Once GitHub finishes loading your Codespace in your browser, look at the terminal at the bottom of the screen.

Type and press Enter:
```bash
bash scripts/run-github-server.sh
```

### What Happens Automatically:
1. PostgreSQL 16 starts and mounts all player tables and economy schemas.
2. Paper 1.20.4 + GeyserMC + Floodgate starts with 10 GB RAM allocated.
3. The Playit.gg cloud tunnel starts and outputs a claim URL:
   ```
   https://playit.gg/claim/xxxxxx
   ```
4. Click that link in your browser once to claim your free permanent address (e.g., `wixfox.gl.joinmc.link` or `wixfox.playit.gg`).

---

## STEP 3: Share with Players & Play!

### 📱 Bedrock Edition (Mobile / Console):
* **Server Address:** The address assigned by Playit (e.g. `xxx.gl.joinmc.link`)
* **Port:** The custom Bedrock port assigned by Playit (e.g. `34512`)

### 💻 Java Edition (PC / Mac):
* **Server Address:** `xxx.gl.joinmc.link:port`

---

## 🛡️ Key Features of This GitHub Cloud Pipeline:
* **Zero VPS Providers:** Everything runs on Microsoft / GitHub data centers.
* **Database Included:** PostgreSQL runs right alongside the game server.
* **Crossplay Active:** Bedrock (UDP) and Java (TCP) crossplay enabled out of the box.
* **No Verification Errors:** Offline / non-premium / crossplay logins are fully permitted without `Failed to verify username`.
