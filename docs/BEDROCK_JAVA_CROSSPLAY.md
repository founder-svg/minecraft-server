# Crossplay Integration Guide (Java + Bedrock)

## 1. Overview
Wixfox Minecraft Network connects players across:
- **Minecraft Java Edition** (Windows, macOS, Linux) via standard TCP port `25565`.
- **Minecraft Bedrock Edition** (iOS, Android, Windows 10/11, Xbox, PlayStation, Switch) via UDP port `19132`.

## 2. GeyserMC Configuration
GeyserMC translates Bedrock network packets into Java packets on the fly.
- Located at: `minecraft/geyser/config.yml`
- Bedrock listen port: `19132` (UDP)
- Target Paper port: `127.0.0.1:25565`
- Auth type: `floodgate`

## 3. Floodgate Authentication
Floodgate removes the requirement for Bedrock players to own a Java Edition Minecraft account:
- Authentication uses asymmetric RSA keys (`key.pem`) generated once and shared between Floodgate and Geyser.
- Bedrock players are assigned a deterministic prefix: `.` (e.g., Bedrock player `Steve` displays as `.Steve`).
- Player UUIDs are deterministically derived from Xbox Live XUIDs, preventing UUID collisions with Mojang Java UUIDs.

## 4. Account Linking
To link an existing Java account to a Bedrock account:
1. Join the server on Java Edition and execute `/linkaccount`.
2. Note the generated 4-digit code.
3. Join on Bedrock Edition and execute `/linkaccount <code>`.
4. The database registers both identities under a unified `player_id`.
