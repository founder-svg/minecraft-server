# Wixfox Minecraft Network — Oracle Cloud Always Free 24/7 Setup Guide

This guide walks you through setting up a **100% Free 24/7 Cloud Server** on Oracle Cloud Infrastructure (OCI).

---

## What Oracle Cloud Provides for Free (Always Free Tier)
* **CPU:** 4 Ampere A1 ARM Cores (or 2 AMD cores)
* **RAM:** Up to **24 GB RAM** (Runs 100+ players easily)
* **Storage:** 200 GB NVMe SSD
* **Public IPv4:** 1 Dedicated Static Public IP address
* **Cost:** **₹0 / month forever**

---

## STEP 1: Create Your Oracle Cloud Account
1. Go to **[cloud.oracle.com/free](https://www.oracle.com/cloud/free/)**.
2. Click **Start for free**.
3. Fill in your details (Country: India, Name, Email).
4. Verify your email and set your password.
5. In **Payment verification**, provide a debit or credit card (Oracle charges a temporary ~$1 verification fee which is refunded immediately. You will **not** be billed as long as you stay in the Always Free tier).

---

## STEP 2: Create the Always Free Compute Instance (VM)
1. In the Oracle Cloud Console dashboard, click **Create a VM instance** (or navigate to **Compute** > **Instances** > **Create instance**).
2. Configure the following:
   * **Name:** `wixfox-minecraft-network`
   * **Image:** Click **Change Image** > Select **Ubuntu 22.04 LTS** (or `Ubuntu 24.04 LTS`).
   * **Shape:** Click **Change Shape**:
     * Select **Ampere** (ARM processor).
     * Set **OCPUs:** `2` or `4` (Always Free allows up to 4).
     * Set **Memory (GB):** `12` or `24` GB (Always Free allows up to 24 GB).
     * Notice the green badge: *"Always Free Eligible"*.
   * **Networking:** Keep defaults (Creates a new Virtual Cloud Network).
   * **Add SSH Keys (IMPORTANT):**
     * Select **Generate a key pair for me**.
     * Click **Save private key** and download the file (e.g., `ssh-key.key`). Save this file on your computer!
3. Click the blue **Create** button at the bottom.
4. Wait 1–2 minutes until the instance state turns green: **RUNNING**.
5. Note down the **Public IP Address** (e.g., `129.150.x.x`).

---

## STEP 3: Open the Game Ports in Oracle Security List (CRITICAL STEP)
> ⚠️ **IMPORTANT:** By default, Oracle Cloud blocks all incoming traffic except SSH. You **MUST** open the Minecraft ports in your Oracle Cloud dashboard, or players will get "Unable to connect".

1. On your instance details page, under **Instance Information**, find **Virtual cloud network** and click the link (e.g., `vcn-...`).
2. Click on the **Public Subnet** link.
3. Click on the **Default Security List for vcn-...**.
4. Click **Add Ingress Rules**:
   
   **Rule 1 — Minecraft Java Edition:**
   * **Source CIDR:** `0.0.0.0/0`
   * **IP Protocol:** `TCP`
   * **Destination Port Range:** `25565`
   * **Description:** `Minecraft Java Edition`
   
   **Rule 2 — Minecraft Bedrock Edition (Geyser Crossplay):**
   * **Source CIDR:** `0.0.0.0/0`
   * **IP Protocol:** `UDP`
   * **Destination Port Range:** `19132`
   * **Description:** `Minecraft Bedrock Edition`
   
   **Rule 3 — Web API & Admin Bridge:**
   * **Source CIDR:** `0.0.0.0/0`
   * **IP Protocol:** `TCP`
   * **Destination Port Range:** `80, 443, 3000`
   * **Description:** `Wixfox Web API Bridge`

5. Click **Add Ingress Rules**.

---

## STEP 4: Connect to Your VPS via SSH
From your Windows computer:
1. Open PowerShell.
2. Locate your downloaded private key (e.g., in `Downloads/ssh-key.key`).
3. Run the following command (replace with your key path and Oracle Public IP):
   ```powershell
   ssh -i "C:\path\to\ssh-key.key" ubuntu@YOUR_ORACLE_PUBLIC_IP
   ```

---

## STEP 5: Deploy the Wixfox Minecraft Network (1-Command Deploy)
Once you are logged into your Ubuntu VPS terminal, copy and run this single command:

```bash
curl -fsSL https://raw.githubusercontent.com/founder-svg/minecraft-server/main/infrastructure/scripts/deploy-oracle-vps.sh | bash
```

### What this automated script does:
1. Updates Ubuntu and configures the host `iptables` and `ufw` firewalls.
2. Installs Docker and the Docker Compose plugin.
3. Clones the `founder-svg/minecraft-server` repository.
4. Generates cryptographically secure production passwords in `.env`.
5. Starts the Paper 1.20.4 + Geyser + PostgreSQL containers.

---

## STEP 6: Connect In-Game!

### 📱 Bedrock Edition (Mobile / Console / Windows):
* **Server Name:** `Wixfox Network`
* **Server Address:** `YOUR_ORACLE_PUBLIC_IP` (e.g., `129.150.x.x` or `play.wixfox.net`)
* **Port:** `19132`

### 💻 Java Edition (PC / Mac):
* **Server Name:** `Wixfox Network`
* **Server Address:** `YOUR_ORACLE_PUBLIC_IP:25565` (or `play.wixfox.net:25565`)

---

## STEP 7: Link Your Domain (play.wixfox.net)
1. Go to your DNS provider (Cloudflare, GoDaddy, Hostinger, etc.).
2. Add an **A Record**:
   * **Type:** `A`
   * **Name:** `play` (or `@`)
   * **Target / Value:** `YOUR_ORACLE_PUBLIC_IP`
   * **TTL:** `Auto` (If using Cloudflare, set proxy to **DNS Only / Gray Cloud** for Minecraft game ports).
